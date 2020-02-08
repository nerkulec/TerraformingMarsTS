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

})