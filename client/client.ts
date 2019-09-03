import socketio = require('socket.io-client');
let io = socketio('http://127.0.0.1:3000');

console.log('Client started');

io.on('connect', () => {
    console.log('Connected to server');

    io.on('hello', (fn: (data: any) => void) => {
        fn('oh hello');
    })
});