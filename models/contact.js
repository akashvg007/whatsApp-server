import mongoose from 'mongoose';

const Contact = new mongoose.Schema({
    name: { type: String, required: true },
    from: { type: String, required: true },
    number: { type: String, required: true }
})
export default mongoose.model('Contact', Contact);