var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var io = require('socket.io')(http);

let messages = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('message load', JSON.stringify(messages));
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);

    let timeStamp = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    messages.unshift({time: timeStamp, message: msg});
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});