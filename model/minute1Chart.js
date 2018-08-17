var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Minute1Chart',new Schema({
    code : String,
    time : Date,
    open : Number,
    close : Number,
    high : Number,
    low : Number,
    volume : Number,
    bVolume : Number,
    sVolume : Number
}));

