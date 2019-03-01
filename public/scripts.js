$(function() {
  let socket = io();
  scrollDown();

  // Form is sent handler
  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    let input = $("#input-form").val();
    
    if (input.startsWith('/nickcolor')) {
      let color = input.substring(input.indexOf('r')+ 1, input.length );
      color = color.trim();

      if (color && /(^[0-9A-F]{6}$)/i.test(color)) {
        socket.emit("color change",
        {
          newColor: color
        });
      }
    }
    else if (input.startsWith('/nick')) {
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
  socket.on('chat message', function(msg){
    appendMessageToList(msg);
    scrollDown();
  });

  socket.on('change name', function(newName) {
    setUserName(newName);
  });

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

  socket.on('active user update', function(activeUsers) {
    updateActiverUserList(activeUsers); //add to list on screen
  });

  //HELPER FUNCTIONS
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

  function appendActiveUserToList(user) {
    $('#users-list').prepend($('<li id=user-' + user.name + '>').text(user.name));
  }

  function updateActiverUserList(users) {
    $('#users-list').empty();
    for(user of users) {
      appendActiveUserToList(user);
    }
  }

  function setUserName(name) {
    $('#username').text(name);
    document.cookie = 'username=' + name;
  }

  function getUserName() {
    return $('#username').text();
  }

  function scrollDown(){
    $('#message-list').animate({scrollTop: $('#message-list').prop("scrollHeight")}, 1);
  }

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

