var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('VolumeAverage',new Schema({
    code : String,
    time : Date,
    vSMA20 : Number,
    bVSMA20 : Number,
    sVSMA20 : Number,
    vSMA5 : Number,
    bVSMA5 : Number,
    sVMA5 : Number
}));

