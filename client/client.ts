const LOG_LEVEL = 1

const socket = io()
let my_id: number

let friends: {[key: number]: Player} = {}

function log(fun: Function, message: string, level: number = 1){
    return(...args: any[]) => {
        if(level <= LOG_LEVEL)
            console.log(message)
        if(LOG_LEVEL >= 3)
            console.log(...args)
        return fun(...args)
    }
}

type Player = {
    id: number,
    name: string,
    online: boolean
}

type Room = {
    name: string,
    room_id: number,
    creator: string,
    creator_id: number, // klikanie w nazwe gracza przenosi na /user/creator_id
    players: number,
    max_players: number, // wyświetlać players/max_players
    elo_range: undefined | number[], // albo nic albo dwie liczby np [1500, 1800], wyświetlić 1500-1800
    ranked: boolean
}

type Notif = {
    text: string,
    references?:{
        user?: number,
        room?: number,
        game?: number
    }
}

function add_rooms(rooms: Room[]){
    rooms.forEach(add_room)
}

function add_room(room: Room){
    let ifRank, eloRange;
    room.ranked === false ? ifRank = 'Unranked' : ifRank = 'Ranked';

    room.elo_range === undefined ? 
    eloRange = 'Any elo' : 
    eloRange = room.elo_range[0] + ' - ' + room.elo_range[1];

    let room_box = document.querySelector('.list-group')
    
    let room_el = document.createElement('div')
    room_el.classList.add('row', 'd-flex', 'mx-0', 'my-3', 'p-0', 'border-0', 'room-box', 'rounded')

    let room_info = document.createElement('div')
    room_info.classList.add('col-9', 'd-flex', 'w-100', 'px-3', 'align-items-center')
        let room_info_details = document.createElement('div')
        room_info_details.classList.add('row', 'd-flex', 'room-details', 'w-100', 'h-100', 'py-3')
            let room_name = document.createElement('div')
            room_name.classList.add('col-3')
            room_name.innerText = room.name
            let room_rank = document.createElement('div')
            room_rank.classList.add('col-3')
            room_rank.innerText = ifRank
            let room_elo = document.createElement('div')
            room_elo.classList.add('col-3')
            room_elo.innerText = eloRange
            let room_players = document.createElement('div')
            room_players.classList.add('col-3')
            room_players.innerText = room.players+'/'+room.max_players

        let room_creator = document.createElement('div')
        room_creator.classList.add('col-2','room-creator-name','d-flex','align-items-center','justify-content-center')
        room_creator.innerHTML = 'by &nbsp;<a href="/user/'+room.creator_id+'">'+room.creator+'</a>'

        let room_enter = document.createElement('div')
        room_enter.classList.add('col-1', 'd-flex', 'align-items-center', 'room-link', 'p-0', 'justify-content-center')
        room_enter.innerHTML = '<a href="/room/'+room.room_id+'"><i class="fas fa-sign-in-alt enter-icon"></i></a>'
    
    room_box!.appendChild(room_el)
        room_el.appendChild(room_info)
            room_info.appendChild(room_info_details)
                room_info_details.appendChild(room_name)
                room_info_details.appendChild(room_rank)
                room_info_details.appendChild(room_elo)
                room_info_details.appendChild(room_players)
        room_el.appendChild(room_creator)
        room_el.appendChild(room_enter)
}

function add_friends(friends: Player[]){
    friends.forEach(add_friend)
    friends.forEach(switch_online)
}

function add_friend(friend: Player){

//     roomStatus = user.in_room ? 'In room' : ''
//     gameStatus = user.in_game ? 'In game' : ''

// <li class="list-group-item d-flex align-items-center bg-transparent border-0 rounded-0" id="<%= user.id %>">
//     <span class="status-dot online mr-3"></span>
//     <span class="mr-2"><i onclick="show_message()" class="fas fa-envelope-square message-icon"></i></span>
//     <span class="mr-2"><a ><i class="far fa-user profile-icon"></i></a></span>
//     <span class="icon mr-1"></span>
//     <span class="friend-name"><%= user.name %></span>
    
        
//     <% if (roomStatus === 'In room') { %>
//         <span class="ml-auto in-room font-weight-bolder"> <%= roomStatus %> </span>
//         <span class="ml-2"><a href="/room/<%= room.id %>"><i class="fas fa-sign-in-alt in-room friend-room-icon font-weight-bolder"></i></a></span>    
//     <% } %>
//     <% if (gameStatus === 'In game') { %>
//         <span class="ml-auto in-game font-weight-bolder"> <%= gameStatus %> </span>
//     <% } %>
// </li>
// <% } %>
    friends[friend.id] = friend
}

function remove_room(room_id: number){
    
}

function update_player(player: Player){
    
}

function switch_online(player: Player){
    let player_nu = document.getElementById(''+player.id+'')

    let status = player_nu!.querySelector('.status-dot')
    status!.classList.toggle('online', player.online)

    console.log(`User ${player.id} became ${player.online?'online':'offline'}`)
}

type Message = {
    from: number,
    to: number,
    text: string
}

function add_messages(messages: Message[]){
    messages.forEach(add_message)
}

function add_message(message: Message){
    const friend = message.to === my_id ? message.from : message.to
    const left = friend === message.from
    let msg_panel = document.getElementById('message-panel'+friend)
    if(!msg_panel){
        show_message(friend)
        msg_panel = document.getElementById('message-panel'+friend)
    }
    let msg_content = msg_panel!.querySelector('.msg-content')
    let messages = msg_content!.querySelector('.messages')

    let from_msg = document.createElement('div')
    from_msg.classList.add('out-message', 'message')
    let msg = document.createElement('p')
    msg.classList.add('m-0')
    msg.innerText = message.text
    
    messages!.appendChild(from_msg)
        from_msg.appendChild(msg)
}

function show_message(id: number){
    get_dms(id)
    let friend = friends[id]
    let msgs_panel = document.querySelector('.messages-panel')
    let el_id = document.getElementById('message-panel'+id+'')
    if(el_id){
        el_id.classList.remove('message-panel-invisible')
    }
    else{
        let msg_window = document.createElement('div')
        msg_window.classList.add('h-100', 'message-panel')
        msg_window.setAttribute('id', 'message-panel'+id+'')
        let msg_top = document.createElement('div')
        msg_top.classList.add('top-msg-panel', 'd-flex', 'align-items-center', 'px-3', 'bg-dark')
            let msg_online_status = document.createElement('span')
            msg_online_status.classList.add('status-dot', 'mr-3')
            let msg_icon = document.createElement('span')
            msg_icon.classList.add('icon', 'mr-1')
            let msg_name = document.createElement('span')
            msg_name.classList.add('friend-name')
            msg_name.innerHTML = friend.name
            let msg_close = document.createElement('span')
            msg_close.classList.add('ml-auto')
            msg_close.innerHTML = '<i onclick="close_message('+id+')" class="fas fa-times close-msg"></i>'
        let msg_content = document.createElement('div')
        msg_content.classList.add('msg-content', 'd-flex', 'flex-column', 'justify-content-between', 'bg-secondary')
            let msg_body = document.createElement('div')
            msg_body.classList.add('d-flex', 'messages','flex-column-reverse')
            let msg_write = document.createElement('input')
            msg_write.classList.add('w-100', 'p-2')
            msg_write.setAttribute('type', 'text')
            msg_write.setAttribute('placeholder', 'Type a message')

    msgs_panel!.appendChild(msg_window)
        msg_window.appendChild(msg_top)
            msg_top.appendChild(msg_online_status)
            msg_top.appendChild(msg_icon)
            msg_top.appendChild(msg_name)
            msg_top.appendChild(msg_close)
        msg_window.appendChild(msg_content)
            msg_content.appendChild(msg_body)
            msg_content.appendChild(msg_write)
    }
}

function close_message(id: number){
    let msg_window = document.getElementById('message-panel'+id+'')
    msg_window!.classList.add('message-panel-invisible')
}

function add_notifications(notifications: Notif[]){
    notifications.forEach(add_notification)
}

function add_notification(notification: Notif){
    // Friend invite
    // Room invite
}

function get_dms(id: number){
    socket.emit('get_dms', id, add_messages)
}

function invite_friend(id: number){
    socket.emit('invite_friend', id)
}

function delete_notification(id: number){
    socket.emit('delete_notification', id)
}

function send_dm(message: any){
    socket.emit('send_dm', message)
}

console.log('Client started')

socket.on('connect', () => {
    console.log('Connected to server')

    socket.emit('get_id', (id: number) => my_id = id)

    socket.on('add_room', log(add_room, "Added room", 3))

    socket.on('remove_room', log(remove_room, "Removed room", 3))

    socket.on('switch_online', log(switch_online, "Switched online", 3))

    socket.on('update_player', log(update_player, "Player updated", 3))

    socket.on('add_message', log(add_message, "Message added", 3))

    socket.on('add_notification', log(add_notification, "Notification added", 3))

    socket.emit('get_friends', log(add_friends, 'Fetched friends'))

    socket.emit('get_rooms', log(add_rooms, 'Fetched rooms'))

    socket.emit('get_notifications', log(add_notifications, 'Fetched notifications'))
})