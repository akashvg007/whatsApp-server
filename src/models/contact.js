const mongoose = require("mongoose");

const Contact = new mongoose.Schema({
  name: { type: String, required: true },
  from: { type: String, required: true },
  phone: { type: String, required: true },
});
const contacts = mongoose.model("Contact", Contact);

const chatlist = new mongoose.Schema({
  from: { type: String, required: true },
  contact: { type: String, required: true },
  cr_date: { type: Number, default: Date.now },
});

const chatlists = mongoose.model("chatlist", chatlist);

module.exports = {
  contacts,
  chatlist,
};
