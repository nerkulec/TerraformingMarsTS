import pg from 'pg'
import {Game} from '../game/Game'
require('dotenv').config()

const db = new pg.Pool({
    host: process.env.DATABASE_URL || 'localhost',
    database: process.env.DB_NAME || 'terraformingmars',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'secret-password'
})

export async function register(req: any, res: any) {
    const {name, password} = req.body
    const id = req.params.id
    // const name = req.body.name
    // const password = req.body.password
    const count = (await db.query('SELECT * FROM users WHERE name = $1', [name])).rowCount
    if(count > 0){
        req.session.error = 'User already exists'
        res.render('register', {session: req.session})
    }else{
        await db.query('INSERT INTO users (name, password_hash) VALUES ($1, crypt($2, gen_salt(\'md5\')))', [name, password])
        console.log('user registered successfully')
        req.session.message = 'Registered successfully!'
        res.redirect('/')
    }
}

export async function remove_user(id: number){
    await db.query(`DELETE FROM users WHERE id = $1`, [id])
}

async function get_games(user_id: number, n: number = 20) {
    const games = (await db.query(`
    SELECT game_id, 
       place, 
	   victory_points, 
	   corporation, 
	   num_generation,
       award_1, award_2, award_3,
       milestone_1, milestone_2, milestone_3
    FROM games 
    JOIN played ON games.id = played.game_id
    JOIN users ON users.id = played.user_id
    WHERE users.id = $1
    ORDER BY date DESC
    LIMIT $2
    `,
    [user_id, n])).rows
    return games
}

export async function get_rooms(settings: any){
    let {n, only_public, not_full} = settings
    n = n || 20
    only_public = only_public || true
    not_full = not_full || true
    const rooms = (await db.query(`
        SELECT rooms.id, rooms.name, owner_id, ranked, min_elo, max_elo,
        max_players, rooms.name AS creator, COUNT(room_players) as players
        FROM rooms
        JOIN users AS owner ON rooms.owner_id = owner.id
        FULL OUTER JOIN users AS room_players ON room_players.in_room = rooms.id
        WHERE rooms.id IS NOT NULL
        GROUP BY rooms.id`)).rows
    return rooms

}
// SELECT rooms.name,
// 	   rooms.id,
// 	   owner_id,
// 	   ranked,
// 	   min_elo, max_elo,
// 	   COUNT(users),
// 	   max_players
// -- 	   owner name
// FROM rooms
// JOIN users ON users.in_room = rooms.id

export async function get_room(req: any, res: any, next: Function) {
    const {room_id} = req.params
    const users = (await db.query(`
        SELECT *
        FROM rooms
        JOIN users ON users.in_room = rooms.id
        WHERE rooms.id = $1`, [room_id])).rows
    if(users.length === 0){
        next()
    }else{
        res.render('room', {session: req.session, users: users})
    }
}

export async function make_room(req: any, res: any) {
    const name = req.session.user.name +'\'s room'
    const id = req.session.user.id
    const room_id = (await db.query(`INSERT INTO rooms
        (owner_id, name) VALUES ($1, $2)
        RETURNING id`, [id, name])).rows[0].id
    await db.query(`UPDATE users
        SET in_room=$1
        WHERE id=$2`, [room_id, id])
    res.redirect('/room/' + room_id)
}

// export async function leave_room(user_id: number){
//     const room_id = (await db.query(`SELECT in_room 
//         FROM users WHERE id = $1`, [user_id])).rows[0].in_room
//     if(room_id){
//         await db.query(`UPDATE users SET in_room=NULL WHERE id=$1`, [user_id])
//         const num = (await db.query(`SELECT COUNT(*)
//             FROM users WHERE in_room=$1`, [room_id])).rows[0].count
//         if(num === 0){
//             await db.query(`DELETE FROM rooms WHERE id=$1`, [room_id])
//         }
//     }
// }

export async function history(req: any, res: any) {
    const {user_id, n} = req.body
    const games = await get_games(user_id, n)
    res.render('history', {session: req.session, games: games})
}

export async function get_users(){
    const users = (await db.query(`SELECT * FROM users`)).rows
    return users
}

export async function get_friends(user_id: number){
    const users = (await db.query(`SELECT users.id AS id, name, elo, icon, in_room
        FROM users
        JOIN friends ON users.id = friend2
        WHERE friend1 = $1`, [user_id])).rows
    return users
}

export async function get_friends_inv(user_id: number){ // Get users for which this user is a friend of
    const users = (await db.query(`SELECT users.id AS id, name, elo, icon, in_room
        FROM users
        JOIN friends ON users.id = friend1
        WHERE friend2 = $1`, [user_id])).rows
    return users
}

export async function login(req: any, res: any, next: Function) {
    const {name, password, guest} = req.body
    if(guest){
        const users = (await db.query('SELECT * FROM users WHERE name = $1', [name])).rows
        if(users.length >= 0){
            req.session.error = 'There exists a user with that name'
            res.redirect('/')
        }else{
            res.session.user = {
                name: 'guest-'+name,
                guest: true
            }
            req.session.message = 'Logged in successfully (as guest)'
            res.redirect('/')
        }
    }else{
        const users = (await db.query('SELECT * FROM users WHERE name = $1 AND password_hash = crypt($2, password_hash)', [name, password])).rows
        if(users.length !== 1){
            req.session.error = 'Wrong password or username'
            res.redirect('/')
        }else{
            req.session.user = users[0]
            delete req.session.user.password_hash
            req.session.message = 'Logged in successfully'
            res.redirect('/')
            next()
        }
    }
}

export async function record_game(game: Game){
    const num_players = game.players.length
}