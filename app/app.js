"use strict";
exports.__esModule = true;
var socketio = require("/usr/local/lib/socket.io");
var io = socketio(3000);
io.on('connection', function (socket) {
    io.emit('this', { will: 'be received by everyone' });
    socket.on('disconnect', function () {
        io.emit('user disconnected');
    });
});
console.log('a');
