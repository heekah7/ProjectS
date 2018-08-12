var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('DailyChart',new Schema({
    code : String,
    time : Date,
    open : Number,
    close : Number,
    high : Number,
    Low : Number,
    volume : Number,
    bVolume : Number,
    sVolume : Number
}));

