$(function() {
  var socket = io();
  scrollDown();

  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  //SOCKET INPUT HANDLERS
  socket.on('chat message', function(msg){
    appendMessageToList(msg);
    scrollDown();
  });

  socket.on('message load', function(msgs) {
    let messages = JSON.parse(msgs);
    messages = messages.reverse();
    for (msg in messages) {
      appendMessageToList(messages[msg].message);
    }
    scrollDown();
  });

  //HELPER FUNCTIONS
  function appendMessageToList(msg) {
    $('#message-list').append($('<li>').text(msg));
  }

  function scrollDown(){
    console.log("scroll");
    $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
  }
});

