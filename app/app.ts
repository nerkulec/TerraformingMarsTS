import socketio from 'socket.io'
import express from 'express'
import bodyParser from 'body-parser'
import session from 'express-session'
import connect_mongo from 'connect-mongo'
import {register, login, get_rooms, enter_room, get_friends, get_users, remove_user,
        make_room, add_message, invite_friend, get_messages, get_notifications,
        delete_notification, add_notification, get_user, leave_room, get_room,
        accept_invite} from './db'
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

app.get('/user/:id', async (req: any, res: any) =>{
    const user = await get_user(req.params.id)
    res.render('user_profile', {session: req.session, user: user})
})

app.get('/room/:room_id', enter_room)
app.get('/create_room', create_room_combined)

app.get('/client.js', (req, res) =>{
    res.sendFile('client.js', {root: './build/client'})
})

app.get('/style.css', (req, res) =>{
    res.sendFile('style.css', {root: './client'})
})

async function send_status(id: number, online: boolean){
    const friends = await get_friends(id)
    const info = {
        id: id,
        online: online
    }
    for(let friend of friends){
        const socket = sockets[friend.id]
        if(socket){
            socket.emit('switch_online', info)
        }
    }
}

async function invite_friend_combined(inviter: {id: number, name: string}, invited: number){
    const q1 = invite_friend(inviter.id, invited)
    const notification = {
        text: inviter.name+' invited you as a friend!',
        referenced_user: inviter.id
    }
    const q2 = add_notification(invited, notification.text,
                                {user: notification.referenced_user})
    await Promise.all([q1, q2])
    if(invited in sockets){
        const socket = sockets[invited]
        socket.emit('add_notification', notification)
    }
}

async function invite_room_combined(inviter: {id: number, name: string},
                                    invited: number, room: number){
    // TODO: check if inviter in room and invited online
    const notification = {
        text: `${inviter.name} invited you to play!`,
        references: {user: inviter.id, room: room}
    }
    await add_notification(invited, notification.text, notification.references)
    if(invited in sockets){
        const socket = sockets[invited]
        socket.emit('add_notification', notification)
    }
}

async function create_room_combined(req: any, res: any){
    const id = await make_room(req, res)
    const room = await get_room(id)
    for(let sio in sockets){
        const socket = sockets[sio]
        socket.emit('add_room', room)
    }

}

async function leave_room_combined(id: number){
    const removed = await leave_room(id)
    if(removed){
        for(let sid in sockets){
            const socket = sockets[sid]
            socket.emit('remove_room', id)
            console.log('sending remove room to '+sid)
        }
    }
}

io.on('connection', (socket) => {
    console.log('Client connected to server')
    const id = socket.request.session?.user?.id
    if(id){
        sockets[id] = socket
        console.log('Added socket for '+socket.request.session.user.name)
        send_status(id, true)
    }
    socket.on('disconnect', () => {
        const id = socket.request.session?.user?.id
        if(id && id in sockets){
            delete sockets[id]
            console.log('Removed socket for '+socket.request.session.user.name)
            const regex = /https?:\/\/\S+\/room\/\d+/
            if(regex.test(socket.request.headers.referer)){
                leave_room_combined(id)
            }
            send_status(id, false)
        }
    })
    socket.on('get_id', (get_id)=>{
        get_id(socket.request.session.user.id)
    })
    socket.on('get_friends', (add_friends) => {
        if(socket.request.session.user){
            get_friends(socket.request.session.user.id).then((friends) => {
                friends.forEach((friend) => friend.online = friend.id in sockets)
                add_friends(friends)
            })
        }
    })
    socket.on('get_rooms', (add_rooms) => {
        get_rooms({n: 20, only_public: true, not_full: true}).then(add_rooms)
    })
    socket.on('get_notifications', (add_notifications) => {
        get_notifications(socket.request.session.user.id).then(add_notifications)
    })
    socket.on('delete_notification', delete_notification)
    // TODO: check if user deletes his own notification
    socket.on('send_dm', (message) => {
        const id = socket.request.session.user.id
        add_message(id, message.to, message.text)
        socket.emit('add_message', {from: id, to: message.to, text: message.text})
        if(message.to in sockets){
            sockets[message.to].emit('add_message', {from: id, to: message.to, text: message.text})
        }
    })
    socket.on('get_dms', (id, add_messages) => {
        get_messages(id, socket.request.session.user.id).then(add_messages)
    })
    socket.on('invite_friend', (id: number) => {
        invite_friend_combined(socket.request.session.user, id)
    })
    socket.on('accept_invite', (id: number) => {
        accept_invite(id, socket.request.session.user.id)
        socket.emit('add_friend', get_user(id))
        if(id in sockets)
            sockets[id].emit('add_friend', get_user(socket.request.session.user.id))
    })
    socket.on('invite_to_room', (user_id: number, room_id: number) => {
        invite_room_combined(socket.request.session.user, user_id, room_id)
    })
})
