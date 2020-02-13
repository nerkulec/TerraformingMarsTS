const socket = io()

let friends: Player[] = [] 

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
    friends.push(friend)
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
    console.log('Added message:')
    console.log(message)
}

type Info = {

}

function add_notification(notification: Info){
    // Friend invite
    // Room invite
}

function get_dms(id: number){
    socket.emit('get_dms', id, add_messages)
}

function invite_friend(id: number){
    socket.emit('invite_friend', id)
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

    socket.on('switch_online', (player: Player) => {
        switch_online(player)
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

    socket.emit('get_friends', (friends: Player[]) => {
        add_friends(friends)
        console.log('Fetched friends')

        // TEST:
        for(let friend of friends){
            console.log('sent dms')
            socket.emit('send_dm', {to: friend.id, text: 'Hello '+friend.name+'!'})
        }
    })

    socket.emit('get_rooms', (rooms: Room[]) => {
        add_rooms(rooms)
        console.log('Fetched rooms')
    })
})