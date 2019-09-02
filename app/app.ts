import socketio = require('socket.io');

let io = socketio(3000);

io.on('connection', function (socket) {
  io.emit('this', { will: 'be received by everyone'});

  socket.on('disconnect', function () {
    io.emit('user disconnected');
  });
});