var socket=io.connect("http://sobin.amtpl.in:8888");
 var typing=false;
 var timeout=0;
	//socket.emit("news","sample");  
  socket.on("chat",function(username, data){
		$('#chatmessages').append('<br/> <b>'+username+'</b>: '+data);
		$('#chatstatus').html('');
  });
  // join success
  socket.on('joinsuccess',function(data){
		$('#chat').show();
		$('#chatuserinfo').hide();
		$('#chatmessages').append(data);		
  });
  // set socketid of current user
  socket.on('setsocketid',function(socketid){
	  $('#mysocket').val(socketid);
  });
  //clear text
  socket.on('updatewindow',function(data){
	  $('#message').val('');
  });
  // Accept request
  socket.on('acceptrequest',function(socketid,username){
	  
	  $('#tosocket').val(socketid);
	  $('#chatmessages').append('<br /> You have joined for a chat with '+username);
  });
  
  // New user joined message
  /*socket.on('newuser',function(username,message,tosocketid){
	  $('#chatmessages').append('<br /><span id="'+tosocketid+'">'+message+' <input type="button" value="Join" onclick="startanewchat(\''+username+'\',\''+tosocketid+'\',this)" /></span>');
  }); */
  
  // update users
  socket.on('updateusers',function(users,busyusers){
	  $('#users').html('');	  
		$.each( users, function( key, value ) {						
		   $('#users').append('<span class="user" id="'+users[key]['id']+'" onclick="startchat(this.id)">User:'+key+'</span><br />');
		});
  });
  
  // trasferred chat
  socket.on('transferredchat',function(tosocket,username){
		  $('#tosocket').val(tosocket);
		  $('#chatmessages').append("<br />Transferred to agent  "+username+"<br/>");		  
	  
  });
  
  // Disconnected
  socket.on('disconnected',function(message){
	$('#tosocket').val('');
	$('#chatmessages').append(message+'<br />');
  });
  // show typing
  socket.on('showtyping',function(message){	  
	  $('#chatstatus').html("<br /><i>"+message+"</i>");
  }); 
  // clear chat status
  socket.on('clearchatstatus',function(){	  
	  $('#chatstatus').html("");
  }); 
  
  
	// control events
	$(document).ready(function(){
		$('#Send').click(function(){
		  var username=$('#username').val();
		  var message=$('#message').val();	  
		  var mysocket=$('#mysocket').val();
		  var tosocket=$('#tosocket').val();
		  
		  if(message!=''){
			  socket.emit("chat",mysocket,username,message,tosocket);
		  }
		  $('#message').val('');
	  });
	  
	  // Join chat
	  $('#join').click(function(){
		  var username=$('#username').val();		  		  
		  socket.emit("chatjoin",username);
	  }); 
	  // show user typing message
	  $('#message').keypress(function(event){
		    if(event.which==13){
				$('#Send').trigger('click');
				socket.emit("clearchatstatus",$('#tosocket').val());
				clearTimeout(timeout);
			}
			else{
				if(typing==false){
					typing=true;
					socket.emit("showtyping",$('#username').val(),$('#tosocket').val(),true);
					timeout = setTimeout(timeoutFunction, 5000);
				}
				else{
					clearTimeout(timeout);
					timeout = setTimeout(timeoutFunction, 5000);
				}
		   }
	  });
	 
	  
	}); 
	
function startchat(s){	
	$('#tosocket').val(s);
	$('#chatmessages').append('<br /> Joined with '+$('#'+s).html());	
	socket.emit("sendrequest",s,$('#mysocket').val(),$('#'+s).html());
}

// Timeout function for user typing status
 function timeoutFunction(){
  typing = false;
  socket.emit("showtyping",$('#username').val(),$('#tosocket').val(),false);
}
