var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('MVolumeAverage',new Schema({
    code : String,
    time : Date,
    vSMA5 : Number,
    bVSMA5 : Number,
    sVSMA5 : Number,
    vSMA : Number,
    bVSMA : Number,
    sVMA : Number
}));

