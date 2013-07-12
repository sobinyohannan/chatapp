var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10; 

var Users = new Schema({
    user_id    : String,
    fullname   : String,
    username   : { type: String,required: true, index: { unique: true }},
    password   : { type: String, required: true },
    updated_at : Date
});

// Methods 
Users.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

Users.methods.getAuthenticated = function(username, password,cb) {
    var usr= mongoose.model('Users', Users);
     usr.findOne({ username: username }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, 'Not found');
            //return cb();
        }        
        
        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                return cb(null,user,'Valid');
            }
            else{
               return cb(null,null,'Invalid');
            }
            
        });
    });
};

Users.methods.testmethod = function(cb){
    return cb('Success');
};

mongoose.model('Users', Users);
module.exports=mongoose.model('Users');

mongoose.connect('mongodb://localhost/agentuserchat');
