import {UserModel as User, SecurityLevel} from './user-model'
import express from 'express'
import crypto from 'crypto-js'

export const register = (req: express.Request, res: express.Response) => {
    if (!req.body) {
        return res.status(400).json({
            success: false,
            error: 'Empty request',
        })
    }

    User.findOne({name: req.body.name}, (err, user) => {
        if (user) {
            res.render('register', {error: 'User already exists'})
        }else{
            const u = new User({
                name: req.body.name,
                passwordHash: crypto.SHA256(req.body.password),
                elo: 800,
                securityLevel: SecurityLevel.registered})
        
            console.log(`Adding user: ${req.body.name}`)
        
            u
                .save()
                .then(() => {
                    res.render('main', {message: 'Registered succesfully!'})
                })
                .catch((error: Error) => {
                    res.render('register', {error: 'Sorry, something went wrong'})
                })

        }
    })
}

export const login = (req: express.Request, res: express.Response) => {
    User.findOne({name: req.body.name}, (err, user) => {
        if (user) {
            let passwordhash = crypto.SHA256(req.body.password)
            let u = user.toObject()
            if(u.name === req.body.name && passwordhash.toString() === u.passwordHash){
                console.log(`User ${u.name} logged in successfully`)
                req.session!.user = u
                res.render("main", {user: u})
            }else{
                console.log(`Failed login attempt to ${u.name}`)
                res.render("main", {error: "Invalid password"})
            }
        }else{
            console.log(`User ${req.body.name} not found`)
            res.render("main", {error: "Invalid username"})
        }
    })
}


export const adminPanel = async (req: express.Request, res: express.Response) => {
    await User.find({}, (err, users) => {
        if (err) {
            res.render('admin_panel', {error: err.message})
        }
        if (!users.length) {
            res.render('admin_panel', {error: 'No users found'})
        }
        res.render('admin_panel', {users})
    }).catch(err => console.log(err))
}
