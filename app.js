const fs = require('fs');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const plantRoutes = require('./routes/plant-route');
const userRoutes = require('./routes/user-route');
const dctreeRoutes = require('./routes/dctree-route');
const datasetRoutes = require('./routes/dataset-route');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));//serve image

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*',);
    res.setHeader('Access-Control-Allow-Headers', 'X-M2M-Origin, Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dctree', dctreeRoutes);
app.use('/api/dataset', datasetRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find route', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if( req.file){
        fs.unlink(req.file.path, (err) => {//delete temp image
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'Unknown error'});
});

mongoose.connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a49lcpp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
).then(()=>{
    app.listen(5000);
}).catch(err=>{
    console.log(err);
});

