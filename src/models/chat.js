const mongoose = require("mongoose");

const ChatScheema = new mongoose.Schema({
  msg: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  time: { type: Number, default: Date.now },
  status: { type: Number, default: 1 },
});
module.exports = mongoose.model("Chat", ChatScheema);
