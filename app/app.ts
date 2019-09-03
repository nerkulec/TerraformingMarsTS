import socketio = require('socket.io');
let io = socketio(3000);

console.log('Server started');

io.on('connection', (socket) => {
    console.log('Client connected to server');

    socket.emit('hello', (data: any) => {
        console.log(data);
    });
});