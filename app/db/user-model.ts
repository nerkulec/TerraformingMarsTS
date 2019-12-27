import mongoose from 'mongoose'
const Schema = mongoose.Schema

const User = new Schema(
    {
        name: {type: String, required: true},
        passwordHash: {type: String, required: true},
        elo: {type: Number, required: true},
    },
    {timestamps: true},
)

export default mongoose.model('users', User)