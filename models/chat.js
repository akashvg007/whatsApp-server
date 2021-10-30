import mongoose from 'mongoose';

const Chat = new mongoose.Schema({
    msg: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    time: { type: Number, default: Date.now },
    status: { type: Number, default: 1 }
})
export default mongoose.model('Chat', Chat);