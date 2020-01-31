import socketio from 'socket.io'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connect_mongo from 'connect-mongo'
import {register, login} from './db/db'
require('dotenv').config()

const MongoStore = connect_mongo(session)
const dburl = process.env.MONGODB_URI || 'mongodb://localhost:27017/TerraformingMarsDB'
const app = express()
const port = process.env.PORT || 3000
const secret = process.env.SECRET || 'total_secret'
const server = app.listen(port)
const io = socketio(server)

console.log('Server started')

app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({url: dburl})
}))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())
app.set('views', './client/views')
app.set('view engine', 'ejs')

app.get('/', async (req, res) =>{
    const rooms = await get_rooms({n: 20, only_public: true, not_full: true})
    res.render('main', {session: req.session, rooms: rooms})
})

app.get('/register', (req, res) =>{
    res.render('register', {session: req.session})
})

app.get('/admin', (req: any, res: any) =>{
    res.render('admin_panel', {session: req.session})
})
app.post('/remove', (req: any, res: any) =>{
    res.render('admin', {session: req.session})
})
app.post('/register', register)
app.post('/login', login)

app.post('/logout', (req, res) =>{
    delete req.session!.user
    res.redirect('/')
})

app.get('/user/:name', (req: any, res: any) =>{
    res.render('user_profile', {session: req.session})
})

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

app.get('/style.css', (req, res) =>{
    res.sendFile('style.css', {root: './client'})
})

io.on('connection', (socket) => {
    console.log('Client connected to server')

    socket.emit('hello', (data: any) => {
        console.log(data)
    })
})
