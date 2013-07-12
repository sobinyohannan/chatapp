
// Load add user page
var mongoose = require( 'mongoose' );
var Users = mongoose.model( 'Users' );
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10; 

exports.adduser=function(req, res){
    res.render('newuser',{title:'New User'});
};

exports.saveuser=function(req, res){ 
  
  var password=req.body.password;
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return false;
   
      // hash the password using our new salt
      bcrypt.hash(req.body.password, salt, function(err, hash) {
          if (err) return false;   
          // override the cleartext password with the hashed one
          console.log(hash);
          password = hash;
          //next();
           var u= new Users({
              fullname  :req.body.fullname,
              username  :req.body.username,
              password	:password,
              updated_at : Date.now()
          });
         
         u.save( function( err, user, count ){
              res.redirect( '/users/view' );
          });
        
      });
  });
     


};

exports.viewusers=function(req, res){
   Users.find(function(err, users){
      res.render('viewusers',{title:'Users List',users:users});
   });
};

exports.loginTest = function(req, res){
    var username=req.params.username;
    var password=req.params.password;
    var user=new Users();    
    user.getAuthenticated(username,password,function(err,user,reason){
        if (err) throw err;

        // login was successful if we have a user
        if (user) {
            // handle login success
            console.log('login success');
            res.send("Login Success");            
        }
        else{
            res.send("Login Failure");
        }
    });
    
}

exports.login=function(req, res){
    res.render('login',{title:'Login'});
}

exports.loginSubmit=function(req, res){
  
    var username=req.body.username;
    var password=req.body.password;
    var user=new Users();    
    user.getAuthenticated(username,password,function(err,user,reason){
        if (err) throw err;

        // login was successful if we have a user
        if (user) {
            // handle login success            
            //res.send("Login Success");    
            req.session.username = username;
            res.redirect('/userhome');           
            //res.render('userhome',{title:'User Home'});
        }
        else{
            //res.send("Login Failure");
            res.render('login',{title:'Login',error:'Login Failure'});
        }
    });
}

exports.userhome=function(req, res){    
      if(req.session.username)
          res.render('userhome',{title:'User Home',username:req.session.username});    
      else
          res.render('login',{title:'Login',message:'You have not logged-in'});
}

exports.logout=function(req, res)
{
    req.session=null;
    res.render('login',{title:'Login',message:'Successfully logged out'});
}


