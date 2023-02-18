const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        return next();
    } 
    try{
        const token = req.headers.authorization.split(' ')[1]; //extract token from metadata
        if(!token){
            throw new Error('Auth failed');
        }
        const decodedToken = jwt.verify(token, 'token_generator'); //verify token
        req.userData = {userId: decodedToken.userId}; //add data to request
        next();
    }catch(err){
        const error = new HttpError('Auth failed', 403);
        return next(error);
    }
    
};