require("dotenv").config({ path: ".env" });
const jwt = require("jsonwebtoken");
const sendResponseMgr = require("../Response/Response");
const UserModel = require("../models/user");
const Contact = require("../models/contact");
const Chat = require("../models/chat");
const { sendOTP, verifyOTP } = require("../helper/helper_Auth");
const { uploadFile, uploadFileStream } = require("../helper/s3");
const { Expo } = require("expo-server-sdk");

const { ACCESS_TOKEN_SECRED, REFRESH_TOKEN } = process.env;

let expo = new Expo();

const generateAccessToken = (user) => {
  const data = typeof user === "object" ? user : { user };
  return jwt.sign(data, ACCESS_TOKEN_SECRED, { expiresIn: "365d" });
};

const ContactList = {};

const uploadImage = async (req, res) => {
  try {
    const { file, type, user } = req.body;
    const result = await uploadFileStream({ file, type });
    console.log("uploadImage::result", result);
    const { Location } = result;
    const query = { phone: user };
    const newData = { profilePic: Location };
    const upsert = { upsert: false };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    sendResponseMgr(true, "Profile Image Updated", res, 200);
  } catch (err) {
    console.log("err in catch::updateImage", err.message);
    sendResponseMgr(true, 101, res, 500);
  }
};

const updateImage = async (req, res) => {
  try {
    const { file, user } = req;
    const result = await uploadFile(file);
    const { Location } = result;
    const query = { phone: user };
    const newData = { profilePic: Location };
    const upsert = { upsert: false };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    // unlinkFile(file?.path);
    sendResponseMgr(true, "Profile Image Updated", res, 200);
  } catch (err) {
    console.log("err in catch::updateImage", err.message);
    sendResponseMgr(true, 101, res, 500);
  }
};

const sendPushNotification = async (token, msg, from) => {
  const message = [];
  const msgObj = {
    to: token,
    sound: "default",
    body: from + ": " + msg,
    data: { title: from },
  };
  message.push(msgObj);
  let chunks = expo.chunkPushNotifications(message);
  let tickets = [];
  (async () => {
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
const sendMessage = async (req, res) => {
  try {
    const { body } = req;
    const { msg, to, from } = body;
    await Chat.create(body);
    const userData = await UserModel.UserModel.users.find({ phone: to });
    const token = userData[0].notificationTk;
    sendPushNotification(token, msg, from);
    sendResponseMgr(false, "message send", res, 200);
  } catch (err) {
    console.log("sendMessage::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const registerOrLogin = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await UserModel.users.find({ phone });
    console.log("result is ", user, phone);
    if (!user) await UserModel.users.create({ name, phone });
    const data = sendOTP(res, phone);
    sendResponseMgr(false, "OTP send", res, 200, data);
  } catch (err) {
    console.log("registerOrLogin::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const verify = async (req, res) => {
  try {
    const { otp, phone } = req.body;
    const payload = { code: otp, to: phone };
    const data = await verifyOTP(res, payload);
    //bypassing the otp
    if (otp !== "0000") {
      if (!data || !data.status || data.status !== "approved") {
        sendResponseMgr(true, 105, res, 400);
        return;
      }
    }
    const query = { phone };
    const newData = { active: true };
    const upsert = { upsert: true };
    const profile = await UserModel.users.findOneAndUpdate(
      query,
      newData,
      upsert
    );
    const accessToken = generateAccessToken(phone);
    const refreshToken = jwt.sign(phone, REFRESH_TOKEN);
    console.log("profile", profile);
    // await Token.create({ refreshToken, phone })
    const token = { accessToken, refreshToken };
    sendResponseMgr(false, "Logged in successful", res, 200, {
      token,
      profile,
    });
  } catch (err) {
    console.log("verify::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const updateNameAndDP = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const query = { phone };
    const newData = { name };
    const upsert = { upsert: true };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    sendResponseMgr(false, "updated", res, 200);
  } catch (err) {
    console.log("verify::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const updateNotificationToken = async (req, res) => {
  try {
    const { token } = req.body;
    const phone = req.user;
    const query = { phone };
    const newData = { notificationTk: token };
    const upsert = { upsert: false };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    sendResponseMgr(false, "updated", res, 200);
  } catch (err) {
    console.log("verify::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const getMessage = async (req, res) => {
  try {
    const { from, to, pagination, lastTime = 0 } = req.body;
    const query = {
      $and: [
        {
          $or: [
            { from, to },
            { from: to, to: from },
          ],
        },
        { time: { $gt: lastTime } },
      ],
    };
    const result = await Chat.find(query).sort({ _id: -1 });
    sendResponseMgr(false, "message send", res, 200, result);
  } catch (err) {
    console.log("getMessage::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const getRecent = async (req, res) => {
  try {
    const from = req.user;
    const { lastTime } = req.params;
    if (!ContactList[from]) ContactList[from] = [];
    console.log("getRecent::from", from);
    const query = {
      $and: [
        { $or: [{ from }, { to: from }] },
        { time: { $gt: lastTime || 0 } },
      ],
    };
    const chats = await Chat.find(query).sort({ _id: -1 });
    // const mappedData = {};
    // chats.forEach(x => {
    //     if (x.from === from) {
    //         if (!mappedData[x.to]) mappedData[x.to] = []
    //         mappedData[x.to].push(x);
    //     }
    //     else {
    //         if (!mappedData[x.from]) mappedData[x.from] = []
    //         mappedData[x.from].push(x);
    //     }
    // });
    // ContactList[from] = Object.keys(mappedData)
    // const lastMessage = Object.keys(mappedData).map((key) => mappedData[key][0])
    sendResponseMgr(false, "", res, 200, chats);
  } catch (err) {
    console.log("getRecent::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const addToContact = async (req, res) => {
  try {
    const from = req.user;
    const { phone, name } = req.body;
    const contact = await Contact.create({ name, phone, from });
    sendResponseMgr(false, "", res, 200, contact);
  } catch (err) {
    console.log("addToContact::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

const getMyContacts = async (req, res) => {
  try {
    const from = req.user;
    const contacts = await Contact.find({ from });
    contacts.forEach((contact) => {
      const { phone } = contact;
      if (ContactList[from] && !ContactList[from].includes(phone)) {
        ContactList[from].push(phone);
      }
    });
    sendResponseMgr(false, "", res, 200, contacts);
  } catch (err) {
    console.log("getMyContacts::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};
const updateProfilePic = async (req, url) => {
  try {
    const phone = req.user;
    const query = { phone };
    const newData = { profilePic: url };
    const upsert = { upsert: true };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
  } catch (err) {
    console.log("getMyContacts::catch", err.message);
    throw err;
  }
};
const removeProfilePic = async (req, res) => {
  try {
    const phone = req.user;
    const query = { phone };
    const newData = { profilePic: "" };
    const upsert = { upsert: true };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    sendResponseMgr(false, "Success", res, 200);
  } catch (err) {
    console.log("getMyContacts::catch", err.message);
    throw err;
  }
};
const updateLastSeen = async (req, res) => {
  try {
    const phone = req.user;
    const query = { phone };
    const lastseen = Date.now();
    const newData = { lastseen };
    const upsert = { upsert: true };
    await UserModel.users.findOneAndUpdate(query, newData, upsert);
    sendResponseMgr(false, "", res, 200);
  } catch (err) {
    console.log("updateLastSeen::catch", err.message);
    throw err;
  }
};
const getLastSeen = async (req, res) => {
  try {
    const { phone } = req.body;
    const result = await UserModel.users.find({ phone });
    sendResponseMgr(false, "", res, 200, result);
  } catch (err) {
    console.log("getLastSeen::catch", err.message);
    throw err;
  }
};

const getAllMyUsers = async (req, res) => {
  try {
    const { phones = [] } = req.body;
    const result = await UserModel.users.find({ phone: { $in: phones } });
    sendResponseMgr(false, "", res, 200, result);
  } catch (err) {
    console.log("getLastSeen::catch", err.message);
    throw err;
  }
};

const updateStatus = async (req, res) => {
  try {
    const { from } = req.params;
    const query = { from, to: req.user, status: 1 };
    const newData = { status: 2 };
    const upsert = { upsert: false };
    console.log("query", query);
    const result = await Chat.updateMany(query, newData, upsert);
    sendResponseMgr(false, "", res, 200, result);
  } catch (err) {
    console.log("getLastSeen::catch", err.message);
    throw err;
  }
};

const getAllMyUserDetails = async (req, res) => {
  try {
    const from = req.user;
    console.log("contactlist", ContactList);

    if ((ContactList && !ContactList[from]) || ContactList[from].length == 0) {
      ContactList[from] = [];
      const query = { $or: [{ from }, { to: from }] };
      const chats = await Chat.find(query).sort({ _id: -1 });
      const mappedData = {};
      chats.forEach((x) => {
        if (x.from === from) {
          if (!mappedData[x.to]) mappedData[x.to] = [];
          mappedData[x.to].push(x);
        } else {
          if (!mappedData[x.from]) mappedData[x.from] = [];
          mappedData[x.from].push(x);
        }
      });
      ContactList[from] = Object.keys(mappedData);
    }
    const contacts = await UserModel.users.find({
      phone: { $in: [from, ...ContactList[from]] },
    });
    sendResponseMgr(false, "", res, 200, contacts);
  } catch (err) {
    console.log("getMyContacts::catch", err.message);
    sendResponseMgr(true, 104, res, 500);
  }
};

module.exports = {
  uploadImage,
  updateImage,
  sendMessage,
  registerOrLogin,
  verify,
  updateNameAndDP,
  updateNotificationToken,
  getMessage,
  getRecent,
  addToContact,
  getMyContacts,
  updateProfilePic,
  removeProfilePic,
  updateLastSeen,
  getLastSeen,
  getAllMyUsers,
  updateStatus,
  getAllMyUserDetails,
};
