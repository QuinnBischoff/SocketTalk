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
  socket.on('chat message', function(msgItem){
    appendMessageToList(msgItem);
    scrollDown();
  });

  socket.on('message load', function(msgs) {
    let messages = JSON.parse(msgs);
    console.log(messages);
    messages = messages.reverse();
    for (msg in messages) {
      appendMessageToList(messages[msg]);
    }
    scrollDown();
  });

  //HELPER FUNCTIONS
  function appendMessageToList(msgItem) {
    $('#message-list').prepend($('<li>').text(msgItem.time + ": " + msgItem.message));
  }

  function scrollDown(){
    console.log("scroll");
    $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
  }
});

