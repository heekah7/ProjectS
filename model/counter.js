var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('StockInfo',new Schema({
    code : String,
    name : String,
    lname: String,
    share: String,
    shariah: String,
}));

