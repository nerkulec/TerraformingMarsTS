import mongoose from 'mongoose'
const Schema = mongoose.Schema

export enum SecurityLevel {unregistered = 0, guest = 1, registered = 2,
                           authenticated = 3, moderator = 5, admin = 10}

const User = new Schema(
    {
        name: {type: String, required: true},
        passwordHash: {type: String, required: true},
        elo: {type: Number, required: true},
        securityLevel: {type: SecurityLevel, required: true}
    },
    {timestamps: true},
)

export const UserModel = mongoose.model('users', User)
