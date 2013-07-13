
var express=require('express');
var app=express();
var http=require('http');
// mongoose setup
require('./mainmodel');
var server=http.createServer(app);
var io=require('socket.io').listen(server);
var path=require('path');

server.listen(8888);



var users={};
var agents={};
var busyagents={};

app.configure( function (){
	app.use(express.static(__dirname + '/public'));
	// Template configs
	app.set('port', process.env.PORT || 8888);
	app.set('views', __dirname + '/tpl/ejs');
	app.set('view engine','ejs');
	app.use( express.logger());
	app.use( express.bodyParser());
	//session
	app.use(express.cookieParser());
	app.use(express.session({secret:'1234567890QWERTY'}));
	app.use( app.router );// this should be always below the body parser as here		
});

app.configure( 'development', function (){
  app.use( express.errorHandler({ dumpExceptions : true, showStack : true }));
});
 
app.configure( 'production', function (){
  app.use( express.errorHandler());
});

// Require router
var routes=require('./routes');

app.get('/users/new',routes.adduser);
app.post('/users/saveuser',routes.saveuser);
app.get('/users/view',routes.viewusers);
app.get('/users/login/:username/:password',routes.loginTest);
app.get('/users/login',routes.login);
app.post('/users/loginSubmit',routes.loginSubmit);
app.get('/userhome',routes.userhome);
app.get('/users/logout',routes.logout);
app.get('/chat/testadd',routes.chattest);
app.get('/chat/view',routes.viewchats);

var agent_index=0;
app.get('/',function(req, res){
	//res.sendfile(__dirname+'/user.html');
	res.render('user');
});
// Route agent page
app.get('/agent',function(req, res){
	//res.sendfile(__dirname+'/agent.html');
	res.render('agent');
});

// Route user page
app.get('/user',function(req, res){
	//res.sendfile(__dirname+'/user.html');
	res.render('user');
});

// Test function to clear agents
app.get('/flush',function(req,res){
	agents={};
	agent_index=0;
	users={};
	res.send("cleared");
});
// Test template page
app.get('/sample',function(req, res){
	req.session ='test';
	console.log("Session is "+req.session);
	res.render('agent');
});

// socket.io connections and methods
io.sockets.on('connection',function(socket){
	var socketid=socket.id;
	
	// user chat join
	socket.on('chatjoin',function(username){
		//users['name']=username;
		users[socket.id]={};
		users[socket.id]['name']=username;		
		io.sockets.socket(socketid).emit('setsocketid',socket.id);
		io.sockets.socket(socketid).emit("joinsuccess",username+" Joined in chat");
		// Send to all users
		socket.broadcast.emit('newuser',username,username+" Joined",socket.id);
		//io.sockets.emit("joinsuccess",username+" Joined in chat");
	}); 
	
	// Agent chat join
	socket.on('agentchatjoin',function(username){
		//users['name']=username;		
		agent_index++;		
		username=(username=='')?'Agent'+agent_index:username;		
		/*agents[agent_index]={};
		agents[agent_index]['username']=username;
		agents[agent_index]['socketid']=socket.id;*/
		
		agents[socket.id]={};
		agents[socket.id]['username']=username;
		agents[socket.id]['status']='FREE';
		io.sockets.socket(socketid).emit('setsocketid',socket.id,username);
		io.sockets.socket(socketid).emit("joinsuccess",username+" Joined in chat");
		// Send to all users
		//socket.broadcast.emit('updateagents',socket.id,agents);
		//io.sockets.emit("joinsuccess",username+" Joined in chat");
		io.sockets.emit("updateagents",socket.id,agents);
	}); 
	// send chat messages
	socket.on('chat',function(fromsocket,username,data,tosocket){ 
			if(tosocket=='')
				socket.emit("chat",username,data);
			else{
				socket.emit("chat",'Me',data);
				io.sockets.socket(tosocket).emit("chat",username,data);
			}			
	});
	
	// Accept incoming chat request
	socket.on('sendrequest',function(socketid,tosocketid,username){	
		agents[tosocketid]['status']='BUSY';
		io.sockets.socket(socketid).emit('acceptrequest',tosocketid,username);
		io.sockets.emit('updateagents',tosocketid,agents);
	});
	
	// remove join button from all user's
		socket.on('removejoinrequest',function(socketid){ 
			io.sockets.emit("removejoin",socketid);
		});
	// transfer chats
	socket.on('transferchat',function(socketid,tosocket,message,tousername){
		// to agent		
		var username=users[tosocket]['name'];
		io.sockets.socket(socketid).emit('transferredchat',tosocket,message,username);
		// to user
		io.sockets.socket(tosocket).emit('transferredchat',socketid,tousername);
		
		// make the user BUSY
		agents[socketid]['status']='BUSY';
		// Free the current agent
		agents[tosocketid]['status']='FREE';
		io.sockets.emit('updateagents',socketid,agents);
	});
	
	// Disconnect chat
	socket.on('disconnectChat',function(socketid,tosocketid){
		agents[socketid]['status']='FREE';
		io.sockets.emit('updateagents',socketid,agents);
		// update to user
		io.sockets.socket(tosocketid).emit('disconnected',"<br />You are disconnected from current chat <br />");
	});
	// Show user is typing message
	socket.on('showtyping',function(username, tosocketid,status){
		if(status==true)
			io.sockets.socket(tosocketid).emit("showtyping",username+" is typing");
		else
			io.sockets.socket(tosocketid).emit("showtyping",username+" has stopped typing");
	});
	
	//clear chat status
	socket.on('clearchatstatus',function(tosocketid){
		io.sockets.socket(tosocketid).emit('clearchatstatus');
	});
	
});



