import socketio from 'socket.io'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connect_mongo from 'connect-mongo'
import {register, login, get_rooms, get_room, get_friends, get_users, remove_user, get_friends_inv} from './db'
require('dotenv').config()

const MongoStore = connect_mongo(session)
const dburl = process.env.MONGODB_URI || 'mongodb://localhost:27017/TerraformingMarsDB'
const app = express()
const port = process.env.PORT || 3000
const secret = process.env.SECRET || 'total_secret'
const server = app.listen(port)
const io = socketio(server)
const sessionMW = session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({url: dburl})
})

let sockets: {[key: number]: any} = {}

app.use(sessionMW)
io.use((socket, next) => sessionMW(socket.request, socket.request.res, next))

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.set('views', './client/views')
app.set('view engine', 'ejs')
app.use('/img', express.static('./client/imgs/'))
app.use((req, res, next) =>{
    const id = req.session?.user?.id
    if(id && id in sockets){
        req.socket = sockets[id]
    }
    next()
})

console.log('Server started')

app.get('/', async (req, res) =>{
    if(req.session!.user && !req.session!.user.guest){
        const rooms = await get_rooms({n: 20, only_public: true, not_full: true})
        const friends = await get_friends(req.session!.user.id)
        res.render('main', {session: req.session, rooms: rooms, friends: friends})
    }else{
        res.render('main', {session: req.session})
    }
})

app.get('/register', (req, res) =>{
    res.render('register', {session: req.session})
})

app.get('/admin', async (req: any, res: any) =>{
    const users = await get_users()
    res.render('admin_panel', {session: req.session, users: users})
})
app.post('/remove', async (req: any, res: any) =>{
    await remove_user(req.body.id)
    res.redirect('/admin')
})
app.post('/register', register)
app.post('/login', login, async (req, res) =>{
    const friends = await get_friends_inv(req.session!.user.id)
    for(let friend of friends){
        const socket = sockets[friend.id]
        if(socket){
            socket.emit('friend_login', req.session!.user.id)
        }else{
            console.log('Did not find socket for user '+friend.name)
        }
    }
})

app.post('/logout', (req, res) =>{
    delete req.session!.user
    res.redirect('/')
})

app.get('/user/:name', (req: any, res: any) =>{
    res.render('user_profile', {session: req.session})
})

app.get('/room/:room_id', get_room)

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

app.get('/style.css', (req, res) =>{
    res.sendFile('style.css', {root: './client'})
})

io.on('connection', (socket) => {
    console.log('Client connected to server')
    const id = socket.request.session?.user?.id
    if(id){
        sockets[id] = socket
    }
    socket.on('disconnect', () => {
        const id = socket.request.session?.user?.id
        if(id && id in sockets){
            delete sockets[id]
        }
    })    
})
