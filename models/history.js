const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historySchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true},
    ph: { type: Number, required: false},
    nitrogen: { type: Number, required: false},
    phospor: { type: Number, required: false},
    kalium: { type: Number, required: false},
    temperature: { type: Number, required: false},
    humidity: { type: Number, required: false},
    date: { type: Date, required: true}
}); 

module.exports = mongoose.model('History', historySchema);