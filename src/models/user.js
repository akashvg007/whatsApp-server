const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: { type: String },
  phone: { type: String, required: true },
  cr_date: { type: Number, default: Date.now },
  active: { type: Boolean, default: false },
  lastseen: { type: Number, default: Date.now },
  profilePic: { type: String, required: false },
  notificationTk: { type: String, default: null },
});
const users = mongoose.model("User", User);

const token = new mongoose.Schema({
  refreshToken: { type: String, required: true },
  phone: { type: String, required: true },
  cr_date: { type: Number, default: Date.now },
});

const tokens = mongoose.model("Token", token);

module.exports = {
  users,
  tokens,
};
