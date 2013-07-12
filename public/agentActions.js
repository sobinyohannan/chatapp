var socket=io.connect("http://sobin.amtpl.in:8888");
      var typing=false;
      var timeout=0;      
      //join success
      socket.on('joinsuccess',function(data){
        $('#chat').show();
        $('#chatuserinfo').hide();
	$('#chatmessages').append(data);
      });
      // set socketid of current user
      socket.on('setsocketid',function(socketid,username){
	$('#mysocket').val(socketid);
	$('#username').val(username);
	
      });
      // New user joined message
      socket.on('newuser',function(username,message,tosocketid){
	$('#chatmessages').append('<br /><span id="'+tosocketid+'">'+message+' <input type="button" value="Join" onclick="startanewchat(\''+username+'\',\''+tosocketid+'\',this)" /></span>');	  
	
      });
      // Accept request
      socket.on('acceptrequest',function(socketid,username){
	$('#tosocket').val(socketid);
	$('#chatmessages').append('<br /> You have joined for a chat with '+username);
	$('#transferblock').show();
	
      });
      // remove join button
      socket.on('removejoin',function(socketid){
	      $('#'+socketid).remove();
      });
      //chat
      socket.on("chat",function(username, data){
	$('#chatmessages').append('<br/><b> '+username+'</b>: '+data);
	$('#chatstatus').html('');
      });
      // update agents
      socket.on('updateagents',function(socketid,agents){
      $('#agents').html('');
      $.each(agents, function( key, value ) {
	if(key!=$('#mysocket').val()&&agents[key]['status']=='FREE') {
	  $('#agents').append('<option value="'+key+'">'+agents[key]['username']+'</option>');
	}
      });
      });
      // transferred chat  
      socket.on('transferredchat',function(tosocket,message,username){	  
	console.info(message);
	var ans=confirm("Trasferred chat.. Do you want to accept?");
	if(ans==true){
	  $('#tosocket').val(tosocket);
	  $('#chatmessages').append("Transferred chat to "+username+"<br/><i>"+message+"</i><br/>");
	  $('#transferblock').show(); 
	}
      });
      // show typing
      socket.on('showtyping',function(message){	  
	$('#chatstatus').html("<br /><i>"+message+"</i>");
      });
      // clear chat status
      socket.on('clearchatstatus',function(){
	$('#chatstatus').html("");
      });  

      $(document).ready(function(){
      var username=$('#username').val();
      socket.emit("agentchatjoin",username);
	// Send chat message
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
	
	// Handle transfer
	$('#transfer').click(function(){
	  var tosocket=$('#tosocket').val();
	  var socketid=$('#agents').val();
	  var message=$('#message').val();
	  var username=$('#agents').text();
	  socket.emit('transferchat',socketid,tosocket,message,username);
	});  
	
	// Disconnect chat
	$('#Disconnect').click(function(){
	  var tosocketid=$('#tosocket').val();
	  var socketid=$('#mysocket').val();
	  $('#tosocket').val('');
	  $('#chatmessages').append(" <br />You are disconnected from current chat <br/>");
	  socket.emit('disconnectChat',socketid,tosocketid);
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

      // start a new chat when agent clicks join button
      function startanewchat(username,tosocketid,b)  {
      $('#tosocket').val(tosocketid);
      $('#chatmessages').append('<br /> Joined with '+username);
      $('#transferblock').show();
      $(b).remove();
      // remove from all others window
      socket.emit("removejoinrequest",tosocketid);
      // Mark these people as occupied
      socket.emit("sendrequest",tosocketid,$('#mysocket').val(),$('#username').val());
      //socket.emit('markasbusy',$('#mysocket').val(),tosocketid);

      }

      // Timeout function for user typing status
      function timeoutFunction(){
	typing = false;
	socket.emit("showtyping",$('#username').val(),$('#tosocket').val(),false);
      }
