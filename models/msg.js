var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var msgSchema = new Schema({
    id: String,
    sendername: String,
    text: String,
    recvname: String
});

module.exports = mongoose.model('msg', msgSchema);