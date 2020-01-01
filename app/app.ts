import socketio from 'socket.io';
import express from 'express';
import bodyParser from 'body-parser'
import session from 'express-session';
import db from './db/db';
import {register, login, adminPanel, removeUser, getUser} from './db/user-ctrl'
import connect_mongo from 'connect-mongo'

const MongoStore = connect_mongo(session)
const app = express();
const port = process.env.PORT || 3000
const secret = process.env.SECRET || 'total_secret'
const server = app.listen(port)
const io = socketio(server)

console.log('Server started');

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: db})
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.set('views', './client/views')
app.set('view engine', 'ejs')

app.get('/', (req, res) =>{
    res.render('main', {session: req.session})
})

app.get('/register', (req, res) =>{
    res.render('register', {session: req.session})
})

app.get('/admin', adminPanel)
app.post('/remove', removeUser)

app.post('/register', register)
app.post('/login', login)
app.post('/logout', (req, res) =>{
    delete req.session!.user
    res.redirect('/')
})

app.get('/user/:name', getUser)

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

app.get('/style.css', (req, res) =>{
    res.sendFile('style.css', {root: './client'})
})

io.on('connection', (socket) => {
    console.log('Client connected to server');

    socket.emit('hello', (data: any) => {
        console.log(data);
    });
});
