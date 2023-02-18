const fs = require('fs');

const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Plant = require('../models/plant');
const User = require('../models/user');
const History = require('../models/history');
const DecisionTree = require('decision-tree');
const dataset = require('../middleware/dataset');

const getPlant = async (req, res, next) => {
  let plant;
  try{
      plant = await Plant.find({}, 'title image description');
  }catch(err){
      const error = new HttpError('get plant info failed', 500);
      return next(error);
  }
  res.json({plants: plant.map(plant => plant.toObject({ getters: true }))});
};

const getPlantById = async (req, res, next) => {
    const plantId = req.params.pid; // { pid: 'p1' }
    let plant;
    try{
      plant = await Plant.findById(plantId);
    }catch (err){
      const error = new HttpError('DB connection error, cannot find plant ID', 500);
      return next(error);
    }

    if (!plant){
      const error = new HttpError('Plant ID not found', 404);
      return next(error);
    }

  let class_name = "conclusion";
  let features = ["temperature","phType","nitrogen","fosfor","kalium","humidity"];

  let training_data = dataset.training_data;
  let test_data = dataset.test_data;
  let predicted_class;
  let accuracy;
  const inputPh = plant.ph;
  const inputTemp = plant.temperature;
  const inputN = plant.nitrogen;
  const inputP = plant.phospor
  const inputK = plant.kalium;
  const inputHumid = plant.humidity;
  
  let dataPh = "";
  let dataTemp = "";
  let dataN = "";
  let dataP = "";
  let dataK = "";
  let dataHumid = "";

  if(inputPh<6){
      dataPh = "acid";
  }else if(inputPh>=6 && inputPh<=7){
      dataPh = "neutral";
  }else if(inputPh>7){
      dataPh = "base";
  }

  if(inputTemp<15){
      dataTemp = "cold";
  }else if(inputTemp>=15 && inputTemp<=39){
      dataTemp = "normal";
  }else if(inputTemp>39){
      dataTemp = "hot";
  }

  if(inputN<11){
      dataN = "low";
  }else if(inputN>=11 && inputN<=14){
      dataN = "normal";
  }else if(inputN>14){
      dataN = "high";
  }

  if(inputP<5){
      dataP = "low";
  }else if(inputP>=5 && inputP<=6){
      dataP = "normal";
  }else if(inputP>6){
      dataP = "high";
  }

  if(inputK<25){
      dataK = "low";
  }else if(inputK>=25 && inputK<=33){
      dataK = "normal";
  }else if(inputK>33){
      dataK = "high";
  }

  if(inputHumid<60){
      dataHumid = "low";
  }else if(inputHumid>=60 && inputHumid<75){
      dataHumid = "normal";
  }else if(inputHumid>=75){
      dataHumid = "high";
  }
  
  try{
      const dt = new DecisionTree(training_data, class_name, features);
      predicted_class = await dt.predict({
          phType: dataPh,
          temperature: dataTemp,
          nitrogen: dataN,
          fosfor: dataP,
          kalium: dataK,
          humidity: dataHumid
      });
      accuracy = dt.evaluate(test_data);
  }catch(err){
      const error = new HttpError('get data error', 500);
      return next(error);
  }

  if(inputPh == null || inputTemp == null){
    predicted_class = "nilai tidak valid";
    accuracy = "-";
  }
    plant['prediction'] = predicted_class;
    plant['accuracy'] = accuracy;
    console.log(plant);
    res.json({plant: plant.toObject({ getters: true })}); // => { plant } => { plant: plant }
};

const getPlantsByUser = async (req, res, next) => {
    const userId = req.params.uid;
    let plants;
    try{
      plants = await Plant.find({ creator: userId });
    }catch(err){
      const error = new HttpError('get plant by creator ID failed', 500);
      return next(error);
    }

  if (!plants || plants.length === 0){
    return next(
      new HttpError('Plants creator ID not found', 404)
    );
  }

    res.json({plants: plants.map(plant => plant.toObject({ getters: true }))});
};

const createPlant = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        throw new HttpError('Invalid input', 422);
    }

    const { title, description, ph, nitrogen, phospor, kalium, temperature, humidity } = req.body; // const title = req.body.title;
    const {prediction, accuracy} = ""

    const createdPlant = new Plant({
      title,
      description,
      image: req.file.path,
      creator: req.userData.userId,
      ph,
      nitrogen,
      phospor,
      kalium,
      temperature,
      humidity,
      prediction,
      accuracy
    });

    let user;
    try{
      user = await User.findById(req.userData.userId);
    }catch(err){
      const error = new HttpError('Creating plant failed', 500);
      return next(error);
    }

    if (!user) {
      const error = new HttpError('Could not find user by ID', 404);
      return next(error);
    }

    console.log(user);

    try{
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdPlant.save({ session: sess });

      user.plants.push(createdPlant);
      await user.save({ session: sess });

      await sess.commitTransaction();
    }catch (err){
      const error = new HttpError('Creating plant failed', 500);
      return next(error);
    }

    res.status(201).json({createdPlant});
};

const createHistory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
      console.log(errors);
      throw new HttpError('Invalid input', 422);
  }

  const { id, title, description, ph, nitrogen, phospor, kalium, temperature, humidity, date } = req.body; // const title = req.body.title;

  const createdHistory = new History({
    id,
    title,
    description,
    ph,
    nitrogen,
    phospor,
    kalium,
    temperature,
    humidity,
    date
  });


  try{
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdHistory.save({ session: sess });

    await sess.commitTransaction();
  }catch (err){
    const error = new HttpError('Creating plant failed', 500);
    return next(error);
  }

  res.status(201).json({createdHistory});
};

const updatePlant = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        console.log(errors);
        return next(new HttpError('Invalid update input', 422));
    }

    const { title, description } = req.body;
    const plantId = req.params.pid;

    let plant;
    try{
      plant = await Plant.findById(plantId);
    }catch(err){
      const error = new HttpError('Update error, cannot update plant', 500);
      return next(error);
    }

    if(plant.creator.toString() !== req.userData.userId){
      const error = new HttpError('Auth error, cannot update', 401);
      return next(error);
    }

    plant.title = title;
    plant.description = description;

    try{
      await plant.save();
    }catch(err){
      const error = new HttpError('Update error, cannot save update plant', 500);
      return next(error);
    }

    res.status(200).json({plant: plant.toObject({ getters: true })});
};

const updateStats = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
      console.log(errors);
      return next(new HttpError('Invalid update input', 422));
  }
  
  const { ph, nitrogen, phospor, kalium, temperature, humidity } = req.body;
  const {prediction, accuracy} = ""
  const plantId = req.params.pid;

  let plant;
  try{
    plant = await Plant.findById(plantId);
  }catch(err){
    const error = new HttpError('Update error, cannot update plant', 500);
    return next(error);
  }

  if(plant.creator.toString() !== req.userData.userId){
    const error = new HttpError('Auth error, cannot update', 401);
    return next(error);
  }

  plant.ph = ph;
  plant.nitrogen = nitrogen;
  plant.phospor = phospor;
  plant.kalium = kalium;
  plant.temperature = temperature;
  plant.humidity = humidity;
  plant.accuracy = accuracy;
  plant.prediction = prediction;

  try{
    await plant.save();
  }catch(err){
    const error = new HttpError('Update error, cannot save update plant', 500);
    return next(error);
  }

  res.status(200).json({plant: plant.toObject({ getters: true })});
};

const deletePlant = async (req, res, next) => {
    const plantId = req.params.pid;
    
    let plant;
    try{
      plant = await Plant.findById(plantId).populate('creator');
    }catch(err){
      const error = new HttpError('Delete error', 500);
      return next(error);
    }

    if (!plant){
      const error = new HttpError('Could not find plant by ID', 404);
      return next(error);
    }

    if(plant.creator.id !== req.userData.userId){
      const error = new HttpError('Auth error, cannot delete', 401);
      return next(error);
    }

    const imagePath = plant.image;

    try{ 
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await plant.remove({session: sess});
      plant.creator.plants.pull(plant);
      await plant.creator.save({session: sess});
      await sess.commitTransaction();      
    }catch(err){
      const error = new HttpError('Delete error, cannot remove plant data', 500);
      return next(error);
    }

    fs.unlink(imagePath, err => {//delete image
      console.log(err);
    })

    res.status(200).json({message: 'Plant Deleted'});
};

const getDctree = async (req, res, next) => {
  
  
  
};

exports.getPlant = getPlant;
exports.getPlantById = getPlantById;
exports.getPlantsByUser = getPlantsByUser;
exports.createPlant = createPlant;
exports.createHistory = createHistory;
exports.updatePlant = updatePlant;
exports.updateStats = updateStats;
exports.deletePlant = deletePlant;
exports.getDctree = getDctree;
