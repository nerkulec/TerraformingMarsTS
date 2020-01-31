import pg from 'pg'
require('dotenv').config()

const db = new pg.Pool({
    host: process.env.DATABASE_URL || 'localhost',
    database: process.env.DB_NAME || 'terraformingmars',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'secret-password'
})

export async function register(req: any, res: any) {
    const {name, password} = req.body
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

export async function login(req: any, res: any) {
    const {name, password} = req.body
    const users = (await db.query('SELECT * FROM users WHERE name = $1 AND password_hash = crypt($2, password_hash)', [name, password])).rows
    if(users.length !== 1){
        req.session.error = 'Wrong password or username'
        res.redirect('/')
    }else{
        req.session.user = users[0]
        req.session.message = 'Logged in successfully'
        res.redirect('/')
    }
}