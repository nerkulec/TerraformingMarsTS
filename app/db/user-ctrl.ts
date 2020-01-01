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
            req.session!.error = 'User already exists'
            res.render('register', {session: req.session})
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
                    req.session!.message = 'Registered succesfully!'
                    res.redirect('/')
                })
                .catch((error: Error) => {
                    req.session!.error = error.message
                    res.render('register', {session: req.session})
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
            }else{
                console.log(`Failed login attempt to ${u.name}`)
                req.session!.error = "Invalid password"
            }
        }else{
            console.log(`User ${req.body.name} not found`)
            req.session!.error = "Invalid username"
        }
        res.redirect('/')
    })
}


export const adminPanel = async (req: express.Request, res: express.Response) => {
    await User.find({}, (err, users) => {
        if (err) {
            req.session!.error = err.message
            res.render('admin_panel', {session: req.session})
        }
        if (!users.length) {
            req.session!.error = 'No users found'
            res.render('admin_panel', {session: req.session})
        }else{
            res.render('admin_panel', {session: req.session, users: users})
        }
    }).catch(err => console.log(err))
}

export const removeUser = async (req: express.Request, res: express.Response) => {
    await User.deleteOne({_id: req.body.id})
        .then(() => {
            req.session!.message = 'User successfully removed'})
        .catch(err => {
            req.session!.error = err.message})
        .finally(() => {
            res.redirect('/admin')})
}

export const getUser = async (req: express.Request, res: express.Response) => {
    await User.findOne({name: req.params.name})
        .then((user) =>{
            res.render('user', {session: req.session, user: user})
        })
        .catch(err => console.log(err))
}