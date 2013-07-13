var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

// Create schema
var Chat=new Schema({
    chat_id    : String,
    user_id   : String,
    message   : { type: String},
    chat_time : Date
});

// mathods
// *************************



//**************************

// Create Model and connect with the DB

mongoose.model('Chatmodel', Chat);
module.exports=mongoose.model('Chatmodel');

mongoose.connect('mongodb://localhost/agentuserchat');
