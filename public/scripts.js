$(function() {
  let socket = io();
  scrollDown();

  // Form is sent handler
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    let input = $("#input-form").val();
    
    //check for color change command
    if (input.startsWith('/nickcolor')) {
      let color = input.substring(input.indexOf('r')+ 1, input.length );
      color = color.trim();
      //regex to confirm the color is valid
      if (color && /(^[0-9A-F]{6}$)/i.test(color)) {
        socket.emit("color change",
        {
          newColor: color
        });
      }
    }
    else if (input.startsWith('/nick')) {
      //send a name change message to server
      let nickname = input.substring(input.indexOf('k')+ 1, input.length );
      nickname = nickname.trim();
      if (nickname) {
        socket.emit("name change", 
        {
         newName: nickname
        });
      }
    }
    else {
      socket.emit("chat message",  input);
    }
    $("#input-form").val("");
    return false;
  });

  //SOCKET INPUT HANDLERS
  
  //chat message handler.
  //received when anybody sends a new message. Clear the messages on screen
  //and redraw them
  socket.on('chat message', function(msg){
    $('#message-list').empty()
    messages = msg.reverse();
    for (msg in messages) {
      appendMessageToList(messages[msg]);
    }
    scrollDown();
  });

  //Name change handler.
  //received when you change your name and server has verified it.
  socket.on('change name', function(newName) {
    setUserName(newName);
  });

  //Message Load handler.
  //called on connection. Loads the username, active users, and messages
  socket.on('message load', function(load) {
    let msgLoad = JSON.parse(load);
    // set username
    setUserName(msgLoad.username);
    // fill out messages
    messages = msgLoad.messages.reverse();
    for (msg in messages) {
      appendMessageToList(messages[msg]);
    }
    scrollDown();
  });

  //Active User Update handler.
  //Called by server when someone joins or leaves the room.
  socket.on('active user update', function(activeUsers) {
    updateActiverUserList(activeUsers); //add to list on screen
  });

  //HELPER FUNCTIONS
  //Adds a styled message to the message list on screen.
  function appendMessageToList(msg) {
    let sentFrom = msg.sender;
    //if it's from us, bold it
    if (sentFrom == getUserName()) {
      sentFrom = '<b>'+ sentFrom +'</b>';
    }
    //add color as class
    sentFrom = '<span class=' + msg.color  +'>' + sentFrom + '</span>';
    $('#message-list').append($('<li>').innerHTML = ("<p>" + msg.time + " " + sentFrom + ": " + msg.message + "</p>"));
    //style items with that class, with that specific color
    $('.' + msg.color).css({'color': '#' + msg.color});
    scrollDown();
  }

  //Adds the an active user to the active user list
  function appendActiveUserToList(user) {
    $('#users-list').prepend($('<li id=user-' + user.name + '>').text(user.name));
  }

  //Completely redraws the active user list
  function updateActiverUserList(users) {
    $('#users-list').empty();
    for(user of users) {
      appendActiveUserToList(user);
    }
  }

  //Sets the current users name
  function setUserName(name) {
    $('#username').text(name);
    document.cookie = 'username=' + name;
  }

  //Returns the current users name
  function getUserName() {
    return $('#username').text();
  }

  //Scrolls the messages view to the bottom.
  function scrollDown(){
    $('#message-list').animate({scrollTop: $('#message-list').prop("scrollHeight")}, 1);
  }

  //Gets the cookie for the application.
  function getCookie(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
});