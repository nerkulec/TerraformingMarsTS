const socket = io()

type Player = {
    id: number,
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
    for(let room of rooms){
        add_room(room);
    }
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
})