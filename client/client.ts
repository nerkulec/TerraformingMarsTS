const socket = io()

type Player = {
    id: number,
    name: string
}

type Room = {
    name: string,
    id: number,
    players: Player[]
}

function add_room(room: Room){
    
}

function remove_room(room_id: number){
    
}

function update_player(player: Player){
    
}

function switch_online(id: number){
    
}

type Message = {

}

function add_message(message: Message){
    
}

type Info = {

}

function add_notification(notification: Info){
    // Friend invite
    // Room invite
}

console.log('Client started')

socket.on('connect', () => {
    console.log('Connected to server')

    socket.on('add_room', (room: Room) => {
        add_room(room)
    })

    socket.on('remove_room', (id: number) => {
        remove_room(id)
    })

    socket.on('friend_login', (id: number) => {
        switch_online(id)
    })

    socket.on('update_player', (player: Player) => {
        update_player(player)
    })

    socket.on('add_message', (message: Message) => {
        add_message(message)
    })

    socket.on('add_notification', (notification: Notification) => {
        add_notification(notification)
    })
})