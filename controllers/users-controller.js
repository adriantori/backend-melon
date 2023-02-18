const { validationResult } = require ('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');


const getUsers = async (req, res, next) => {
    let users;
    try{
        users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError('get user and email failed', 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const signup = async (req, res, next) => {
    const errors = validationResult(req); //input validation
    if (!errors.isEmpty()){
        return next (new HttpError('Invalid signup input', 422));
    }

    const { name, email, password } = req.body; //store input value

    let hashedPassword; //encrypt password
    try{
        hashedPassword = await bcrypt.hash(password, 12);  
    }catch(err){
        const error = new HttpError('cannot create user, try again', 500);
    }

    let existingUser; //check if user exist
    try{
        existingUser = await User.findOne({ email: email });
    }catch(err){
        const error = new HttpError('Signup failed', 500);
        return next(error);
    }

    if (existingUser){ //if user exist
        const error = new HttpError('User already exist, login instead', 422);
        return next(error);
    }

    const createdUser = new User({ //creating new user data
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        plants: []
    });

    try{ //saving user data
        await createdUser.save();
    }catch (err){
        const error = new HttpError('Creating user failed', 500);
        return next(error);
    }

    let token;//generate token
    try{
        token = jwt.sign({userId: createdUser.id, email: createdUser.email}, 'token_generator', {expiresIn: '1h'});
    }catch(err){
        const error = new HttpError('Signup failed', 500);
        return next(error);
    }

    res.status(201).json({userId: createdUser.id, email: createdUser.email, token: token}); //return valid data
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser; //check if user exist
    try{
        existingUser = await User.findOne({ email: email });
    }catch(err){
        const error = new HttpError('Logged in failed', 500);
        return next(error);
    }

    if(!existingUser){ //if user not exist
        const error = new HttpError('Invalid user or password', 403);
        return next(error);
    }

    let isValidPassword = false; //compare hashed pass for login
    try{ 
        isValidPassword = await bcrypt.compare(password, existingUser.password);  
    }catch(err){
        const error = new HttpError('cant logged in, try changing email/password', 500);
    }

    if (!isValidPassword){ //if password invalid
        const error = new HttpError('Invalid user or password', 403);
        return next(error);
    }

    let token; //generate token
    try{
        token = jwt.sign({userId: existingUser.id, email: existingUser.email}, 'token_generator', {expiresIn: '1h'});
    }catch(err){
        const error = new HttpError('Login failed', 500);
        return next(error);
    }

    res.json({userId: existingUser.id, email:existingUser.email, token: token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;