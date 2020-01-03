import {RoomModel as Room, GameType} from './room-model'
import express from 'express'

export const createRoom = async (req: express.Request, res: express.Response) => {
    await Room.findOne({name: req.body.name})
        .then((room) => {
            if(room){
                req.session!.error = "Name already taken"
            }else{
                const r = new Room({
                    name: req.body.name,
                    owner: req.session!.user._id,
                    players: [req.session!.user._id],
                    gameType: req.body.gameType})
            
                console.log(`New room: ${req.body.name}`)
            
                r
                    .save()
                    .then(() => {
                        req.session!.message = 'Room created succesfully!'
                        res.redirect('/room/'+req.body.name)
                    })
                    .catch((error: Error) => {
                        req.session!.error = error.message
                        res.render('create_room', {session: req.session})
                    })
            }
        })
}

export const enterRoom = async (req: express.Request, res: express.Response) => {
    await Room.updateOne({name: req.params.name}, {$push: {users: req.session!.user._id}}, (err) => {
        if (err){
            req.session!.error = err.message
            res.redirect('/play')
        }
    })
}

export const removeRoom = async (req: express.Request, res: express.Response) => {
    await Room.deleteOne({_id: req.body.id})
        .then(() => {
            req.session!.message = 'Room successfully removed'})
        .catch(err => {
            req.session!.error = err.message})
        .finally(() => {
            res.redirect('/admin')})
}

export const getRoom = async (req: express.Request, res: express.Response) => {
    await Room.findOne({name: req.params.name})
        .then((room) =>{
            res.render('room_profile', {session: req.session, room: room})
        })
        .catch(err => console.log(err))
}