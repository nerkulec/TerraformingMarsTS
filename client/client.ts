const LOG_LEVEL = 3

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
    online: boolean,
    in_room: boolean,
    in_game: boolean,
    //jeśli w pokoju to jakim
    room_num: number
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
    console.log(friends)
    friends.forEach(add_friend)
    friends.forEach(switch_online)
}

function add_friend(friend: Player){

    let roomStatus = friend.in_room ? 'In room' : ''
    let gameStatus = friend.in_game ? 'In game' : ''

    let friends_list = document.querySelector('.friends-list')
        let friend_el = document.createElement('li')
        friend_el.classList.add('list-group-item', 'd-flex', 'align-items-center', 'bg-transparent', 'border-0', 'rounded-0')
        friend_el.setAttribute('id', ''+ friend.id +'')
            let friend_status = document.createElement('span')
            friend_status.classList.add('status-dot', 'mr-3')
            let msg_btn = document.createElement('span')
            msg_btn.classList.add('mr-2')
            msg_btn.innerHTML = '<i onclick="show_message('+friend.id+')" class="fas fa-envelope-square message-icon"></i>'
            let profile_btn = document.createElement('span')
            profile_btn.classList.add('mr-2')
            profile_btn.innerHTML = '<a href="/user/'+ friend.id +'"><i class="far fa-user profile-icon"></i></a>'
            let friend_icon = document.createElement('span')
            friend_icon.classList.add('icon', 'mr-1')
            let friend_name = document.createElement('span')
            friend_name.classList.add('friend-name')
            friend_name.innerText = friend.name
            //in room
            let in_room_info = document.createElement('span')
            in_room_info.classList.add('ml-auto', 'in-room', 'font-weight-bolder')
            in_room_info.innerText = roomStatus
            let in_room_btn = document.createElement('span')
            in_room_btn.classList.add('ml-2')
            in_room_btn.innerHTML = '<a href="/room/'+ friend.room_num +'"><i class="fas fa-sign-in-alt in-room friend-room-icon font-weight-bolder"></i></a>'
            //in game
            let in_game_info = document.createElement('span')
            in_game_info.classList.add('ml-auto', 'in-game', 'font-weight-bolder')
            in_game_info.innerText = gameStatus

    friends_list!.appendChild(friend_el)
        friend_el.appendChild(friend_status)
        friend_el.appendChild(msg_btn)
        friend_el.appendChild(profile_btn)
        friend_el.appendChild(friend_icon)
        friend_el.appendChild(friend_name)
        if(roomStatus === 'In room'){
            friend_el.appendChild(in_room_info)
            friend_el.appendChild(in_room_btn)
        }
        if(gameStatus === 'In game'){
            friend_el.appendChild(in_game_info)
        }
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
    
    let message_panel = document.getElementById('message-panel'+player.id+'')
    if(message_panel){
        console.log('switchin online')
        let message_nu = message_panel.querySelector('.top-msg-panel')
        let message_status = message_nu!.querySelector('.status-dot')
        message_status!.classList.toggle('online', player.online)
    }
    friends[player.id].online = player.online
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
    }else{
    let msg_content = msg_panel!.querySelector('.msg-content')
    let messages = msg_content!.querySelector('.messages')

    let from_msg = document.createElement('div')
        if(left){
            from_msg.classList.add('out-message', 'message', 'd-flex', 'align-self-start')
        }
        else{
            from_msg.classList.add('int-message', 'message', 'd-flex', 'align-self-end')
        }
        let msg = document.createElement('p')
        msg.classList.add('m-0')
        msg.innerText = message.text
        messages!.insertAdjacentElement('afterbegin', from_msg)
        from_msg.appendChild(msg)
    }
}

function send_on_enter(id: number){
    let input = <HTMLInputElement>document.getElementById('msg-text'+id+'')
    let text = input.value
    console.log('sending msg to'+id+'text: '+text+'')
    input.value = ''
    send_dm(id, text || '')
    return false
}

function show_message(id: number){
    if(!document.getElementById('message-panel'+id+'')){
        get_dms(id)
    let friend = friends[id]
    let msgs_panel = document.querySelector('.messages-panel')
    let el_id = document.getElementById('message-panel'+id+'')

        let msg_window = document.createElement('div')
        msg_window.classList.add('h-100', 'message-panel')
        msg_window.setAttribute('id', 'message-panel'+id+'')
        let msg_top = document.createElement('div')
        msg_top.classList.add('top-msg-panel', 'd-flex', 'align-items-center', 'px-3', 'bg-dark')
            let msg_online_status = document.createElement('span')
            msg_online_status.classList.add('status-dot', 'mr-3')
            if(friend.online){
                msg_online_status.classList.add('online')
            }
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
            msg_body.classList.add('d-flex', 'messages','flex-column-reverse', 'p-2', 'h-100')
            let form = document.createElement('form')
            form.setAttribute('onsubmit', 'return send_on_enter('+friend.id+')')
            let msg_write = document.createElement('input')
            msg_write.classList.add('w-100', 'p-2')
            msg_write.setAttribute('id', 'msg-text'+friend.id+'')
            msg_write.setAttribute('type', 'text')
            msg_write.setAttribute('placeholder', 'Type a message')
            let submit = document.createElement('input')
            submit.classList.add('hidden')
            submit.setAttribute('type', 'submit')

            

    msgs_panel!.appendChild(msg_window)
        msg_window.appendChild(msg_top)
            msg_top.appendChild(msg_online_status)
            msg_top.appendChild(msg_icon)
            msg_top.appendChild(msg_name)
            msg_top.appendChild(msg_close)
        msg_window.appendChild(msg_content)
            msg_content.appendChild(msg_body)
            msg_content.appendChild(form)
                form.appendChild(msg_write)
                form.appendChild(submit)

    }
}

function close_message(id: number){
    let msg_window = document.getElementById('message-panel'+id+'')
    msg_window!.outerHTML = ""
}

function add_notifications(notifications: Notif[]){
    notifications.forEach(add_notification)
}

function add_notification(notification: Notif){
    // Friend invite
    // Room invite
    let notifications = document.getElementById('notifications')
    let notif_div = document.createElement('div')
    notif_div.innerHTML = notification.text + '<button onclick=accept_invite('+notification.references!.user+')/>'
    notifications!.appendChild(notif_div)
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

function send_dm(to: number, text: string){
    socket.emit('send_dm', {to: to, text: text})
}

function accept_invite(id: number){
    socket.emit('accept_invite', id)
}

console.log('Client started')

socket.on('connect', () => {
    console.log('Connected to server')

    socket.emit('get_id', (id: number) => my_id = id)

    socket.on('add_room', log(add_room, "Added room", 3))

    socket.on('remove_room', log(remove_room, "Removed room", 3))

    socket.on('switch_online', log(switch_online, "Switched online", 3))

    socket.on('update_player', log(update_player, "Player updated", 3))

    socket.on('add_friend', log(add_friend, "Added friend", 3))

    socket.on('add_message', log(add_message, "Message added", 3))

    socket.on('add_notification', log(add_notification, "Notification added", 3))

    socket.emit('get_friends', log(add_friends, 'Fetched friends'))
    if(window.location.pathname === '/'){
        socket.emit('get_rooms', log(add_rooms, 'Fetched rooms'))
    }

    socket.emit('get_notifications', log(add_notifications, 'Fetched notifications'))
})