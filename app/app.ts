import socketio from 'socket.io'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connect_mongo from 'connect-mongo'
import {register, login, get_rooms, get_room, get_friends,
        get_users, remove_user, get_friends_inv, make_room,
        add_message,
        get_messages} from './db'
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
        res.render('main', {session: req.session})
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
app.post('/login', login)

app.post('/logout', (req, res) =>{
    delete req.session!.user
    res.redirect('/')
})

app.get('/user/:name', (req: any, res: any) =>{
    res.render('user_profile', {session: req.session})
})

app.get('/room/:room_id', get_room, make_room)

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

app.get('/style.css', (req, res) =>{
    res.sendFile('style.css', {root: './client'})
})

async function send_status(id: number, online: boolean){
    const friends = await get_friends_inv(id)
    const info = {
        id: id,
        online: online
    }
    for(let friend of friends){
        const socket = sockets[friend.id]
        if(socket){
            socket.emit('switch_online', info)
        }else{
            console.log(`${friend.name} not connected`)
        }
    }
}

io.on('connection', async (socket) => {
    console.log('Client connected to server')
    const id = socket.request.session?.user?.id
    if(id){
        sockets[id] = socket
        await send_status(id, true)
    }
    socket.on('disconnect', async () => {
        const id = socket.request.session?.user?.id
        if(id && id in sockets){
            delete sockets[id]
            await send_status(id, false)
        }
    })
    socket.on('get_friends', async (add_friends) => {
        if(socket.request.session.user){
            const friends = await get_friends(socket.request.session.user.id)
            add_friends(friends)
        }
    })
    socket.on('get_rooms', async (add_rooms) => {
        const rooms = await get_rooms({n: 20, only_public: true, not_full: true})
        add_rooms(rooms)
    })
    socket.on('send_dm', async (message) => {
        const id = socket.request.session.user.id
        add_message(id, message.to, message.text)
        if(message.to in sockets){
            sockets[message.to].emit('add_message', {from: id, to: message.to, text: message.text})
        }
    })
    socket.on('get_dms', async (id: number, add_messages) => {
        const messages = await get_messages(id, socket.request.session.user.id)
        add_messages(messages)
    })
})
