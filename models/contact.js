import mongoose from 'mongoose';

const Contact = new mongoose.Schema({
    name: { type: String, required: true },
    from: { type: String, required: true },
    number: { type: String, required: true }
})
export default mongoose.model('Contact', Contact);

const chatlist = new mongoose.Schema({
    from: { type: String, required: true },
    contact: { type: String, required: true },
    cr_date: { type: Number, default: Date.now },
})

export const list = mongoose.model('Token', chatlist)