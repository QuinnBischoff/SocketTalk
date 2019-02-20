$(function() {
  var socket = io();
  scrollDown();

  $("form").submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  socket.on('chat message', function(msg){
  $('#message-list').append($('<li>').text(msg));
  scrollDown();
  });

  function scrollDown(){
    console.log("scroll");
    $('#message-box').scrollTop($('#message-box')[0].scrollHeight);
  }
});

