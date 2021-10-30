import mongoose from 'mongoose';

const User = new mongoose.Schema({
    name: { type: String },
    phone: { type: String, required: true },
    cr_date: { type: Number, default: Date.now },
    active: { type: Boolean, default: false },
    lastseen: { type: Number, default: Date.now }
})
export default mongoose.model('User', User);

const token = new mongoose.Schema({
    refreshToken: { type: String, required: true },
    phone: { type: String, required: true },
    cr_date: { type: Number, default: Date.now },
})

export const Token = mongoose.model('Token', token)