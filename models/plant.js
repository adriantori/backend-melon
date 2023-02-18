const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const plantSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true},
    image: {type: String, required: true},
    creator: {type: mongoose.Types.ObjectId, required: true, ref: 'User'},
    ph: { type: Number, required: false},
    nitrogen: { type: Number, required: false},
    phospor: { type: Number, required: false},
    kalium: { type: Number, required: false},
    temperature: { type: Number, required: false},
    humidity: { type: Number, required: false},
    accuracy: { type: Number, required: false},
    prediction: {type: String, required: false}
}); 

module.exports = mongoose.model('Plant', plantSchema);