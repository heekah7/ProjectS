var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Transaction',new Schema({
    code : String,
    price : String,
    volume : String,
    time : Date,
    mode : String
}));
