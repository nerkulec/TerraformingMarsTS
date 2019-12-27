import socketio from 'socket.io';
import express from 'express';
import bodyParser from 'body-parser'
import './db/db';
import {register, userList} from './db/user-ctrl'

const app = express();
const port = process.env.PORT || 3000
const server = app.listen(port)
const io = socketio(server)

console.log('Server started');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('views', './client/views')
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('play')
})

app.get('/register', (req, res) =>{
    res.render('register')
})

app.post('/register', register)
app.get('/users', userList)

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

io.on('connection', (socket) => {
    console.log('Client connected to server');

    socket.emit('hello', (data: any) => {
        console.log(data);
    });
});
