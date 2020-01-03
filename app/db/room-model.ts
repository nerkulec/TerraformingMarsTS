import mongoose from 'mongoose'
const Schema = mongoose.Schema

export enum GameType {unranked = 0, ranked = 1, tournament = 2}

const Room = new Schema(
    {
        name: {type: String, required: true},
        owner: {type: Schema.Types.ObjectId, ref:'User', required: true},
        players: [{type: Schema.Types.ObjectId, ref:'User', required: true}],
        gameType: {type: GameType, required: true},
        inProgress: {type: Boolean, required: true, default: false}
    },
    {timestamps: true},
)

export const RoomModel = mongoose.model('rooms', Room)
