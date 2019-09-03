import socketio = require('socket.io');

let io = socketio(3000);

io.on('connection', (socket) => {
  io.emit('this', { will: 'be received by everyone'});

  socket.on('disconnect', () => {
    io.emit('user disconnected');
  });
});