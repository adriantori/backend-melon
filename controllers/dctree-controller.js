const DecisionTree = require('decision-tree');
const dataset = require('../middleware/dataset');

const HttpError = require('../models/http-error');

const getDctree = async (req, res, next) => {
    
    let class_name = "conclusion";
    let features = ["temperature","phType","nitrogen","fosfor","kalium","humidity"];

    let training_data = dataset.training_data;
    let test_data = dataset.test_data;


    const inputPh = 5;
    const inputTemp = 39;
    const inputN = 15;
    const inputP = 7;
    const inputK = 22;
    const inputHumid = 45;
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
        const predicted_class = await dt.predict({
            phType: dataPh,
            temperature: dataTemp,
            nitrogen: dataN,
            fosfor: dataP,
            kalium: dataK,
            humidity: dataHumid
        });
        const accuracy = dt.evaluate(test_data);
        console.log("Accuracy: " + accuracy);
        console.log("Prediction: " + predicted_class);
    }catch(err){
        const error = new HttpError('fetch data error', 500);
        return next(error);
    }
    
};

exports.getDctree = getDctree;