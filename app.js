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
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
    console.log(messages);
  });
  
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    messages.unshift(msg);
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on port 3000');
});