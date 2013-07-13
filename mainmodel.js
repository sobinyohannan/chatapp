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

// Create chat schema
var Chat=new Schema({
    chat_id    : String,
    user_id   : {type: Schema.Types.ObjectId,ref: 'Users' },
    message   : { type: String},
    chat_time : Date
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
// Chat model methods
Chat.methods.testAdd=function(cb){
  
    var username='sonu';
    var usr= mongoose.model('Users', Users);
    usr.findOne({username:username},function(err,user){
        if(err) cb(null);
        else{
            var chat=mongoose.model('Chat',Chat);
            var ch=new chat({user_id:user._id,message:'test message',chat_time:Date.now()});
            
            ch.save(function(err){
                if(err) cb(null);
                else cb('success');
            });
        }
    });
    
    
}

Chat.methods.viewchats=function(cb){
    var chat=mongoose.model('Chat',Chat);
    chat.find(function(err,chat){
        if(err) cb(null,null);
        else{
            cb('Success',chat);
        }
    });
}

mongoose.model('Users', Users);
mongoose.model('Chat',Chat);
module.exports=mongoose.model('Users');
module.exports=mongoose.model('Chat');

mongoose.connect('mongodb://localhost/agentuserchat');


/********** Reference Methods ****************
// Update example
Tank.findById(id, function (err, tank) {
  if (err) return handleError(err);
  
  tank.size = 'large';
  tank.save(function (err) {
    if (err) return handleError(err);
    res.send(tank);
  });
});

// OR
Tank.update({ _id: id }, { $set: { size: 'large' }}, callback);
* OR
Tank.findByIdAndUpdate(id, { $set: { size: 'large' }}, function (err, tank) {
  if (err) return handleError(err);
  res.send(tank);
});


********** End ******************************/
