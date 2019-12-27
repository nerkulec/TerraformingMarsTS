import User from './user-model'
import express from 'express'
import crypto from 'crypto-js'

export const register = (req: express.Request, res: express.Response) => {
    if (!req.body) {
        return res.status(400).json({
            success: false,
            error: 'Empty request',
        })
    }

    // TODO: Add uniqueness check

    const user = new User({
        name: req.body.name,
        passwordHash: crypto.SHA256(req.body.password),
        elo: 800})

    console.log(`Adding user: ${req.body.name}`)

    user
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: user._id,
                message: 'User registered!',
            })
        })
        .catch((error: Error) => {
            return res.status(400).json({
                error,
                message: 'User not registered!',
            })
        })
}

export const userList = async (req: express.Request, res: express.Response) => {
    await User.find({}, (err, users) => {
        if (err) {
            return res.send({ success: false, error: err })
        }
        if (!users.length) {
            return res.send({ success: false, error: 'No users found' })
        }
        res.render('userList', {users})
    }).catch(err => console.log(err))
}
