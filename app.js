var express = require('express');
var cookieReader = require('cookie');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

let messages = [];
let usernames = ['Koala', 'Elephant', 'Kangaroo', 'Dolphin', 'Grizzly', 'Moose'];
let users = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
//  console.log("here");
 // res.cookie("username", "quinn");
 // res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  let cookieString = socket.handshake.headers.cookie;
  let connectedUser;
  let newUser = true;
  if (cookieString) {
    let cookies = cookieReader.parse(socket.handshake.headers.cookie);
    //create a new user object
    if (cookies.username) {
      connectedUser = users.find(user => user.name === cookies.username);
      if (connectedUser) {
        newUser = false;
        connectedUser.active = true;
      }
    }
  }
  if (newUser) {
    let username = getRandomName();
    if(!username) {
      return;
    }
    connectedUser = {
      name: username,
      color: '000000',
      active: true,
      };
    users.unshift(connectedUser); //add user to users list
  }
  socket.user= connectedUser; //set the user for the socket so we know who the socket is
  socket.emit('message load', 
    JSON.stringify(
      {
       username: connectedUser.name,
       messages: messages,
    })); //send the user their set name, and all the existing messages
  //tell everyone to update their active list
  io.emit('active user update', getActiveUsers());
  

  socket.on('disconnect', function() {
    users[users.indexOf(socket.user)].active = false; //remove from active
    //tell everyone to update their active list
    io.emit('active user update', getActiveUsers());
  });
  
  socket.on('chat message', function(msg){
    let timeStamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    messageItem = {time: timeStamp, message: msg, sender: socket.user.name, color: socket.user.color};
    messages.unshift(messageItem);
    io.emit('chat message', messages);
  });

  socket.on('color change', function(data) {
    socket.user.color = data.newColor;
  });

  socket.on('name change', function(data) {
    if (!validateNewName(data.newName)) {
      return;
    }
    for (message of messages) {
      if (message.sender === socket.user.name) {
        message.sender = data.newName;
      }
    }
    socket.user.name = data.newName;
    socket.emit('change name', data.newName);
    io.emit('active user update', getActiveUsers());
    io.emit('chat message', messages);
  });

});

http.listen(3000, function(){
  console.log('listening on port 3000');
});

//Helper functions
function getActiveUsers() {
  let activeUsers = users.filter(user => {
    return user.active === true
  });
  return activeUsers;
}

function validateNewName(name) {
  for (user of users) {
    if (user.name == name) {
      return false;
    }
  }
  return true;
}
//gets a random name, if another user already has it, then try another.
function getRandomName() {
  let nameIndex = Math.floor(Math.random()*usernames.length);
  let name = usernames[nameIndex];
  //try to find a non-used name, if can't find one after 10 times, say chat's full
  let nameUnique = false;
  for(let i = 0; i < 10; i++) {
    if (!users.find(a => a.name == name)) {
      nameUnique = true;
      break;
    }
    nameIndex = Math.floor(Math.random()*usernames.length);
    name = usernames[nameIndex];
  }
  if(nameUnique = true) {
    return name;
  }
  else {
    return null;
  }
}