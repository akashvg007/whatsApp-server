import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { sendResponse } from "../Response/Response";
import { encryptPassword, compareHash } from "../helper/authHelper";
import moment from "moment";
import { validateArray } from "../helper/common";
// import mongoose from 'mongoose';
import User, { Token } from "../models/user";
import Contact from "../models/contact";
import Chat from "../models/chat";
import { sendOTP } from "../helper/helper_Auth";
import { verifyOTP } from "../helper/helper_Auth";

config();
const { ACCESS_TOKEN_SECRED, REFRESH_TOKEN } = process.env;

const generateAccessToken = (user) => {
    const data = typeof user === "object" ? user : { user };
    return jwt.sign(data, ACCESS_TOKEN_SECRED, { expiresIn: "365d" });
};

const ContactList = {};

export const registerOrLogin = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User.find({ phone });
        console.log("result is ", user, phone);
        if (!user) await User.create({ name, phone })
        const data = sendOTP(res, phone);
        sendResponse(false, "OTP send", res, 200, data);
    }
    catch (err) {
        console.log("registerOrLogin::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}

export const verify = async (req, res) => {
    try {
        const { otp, phone } = req.body;
        const payload = { code: otp, to: phone }
        const data = await verifyOTP(res, payload)
        //bypassing the otp
        if (otp !== "0000") {
            if (!data || !data.status || data.status !== "approved") {
                sendResponse(true, 105, res, 400);
                return;
            }
        }
        const query = { phone };
        const newData = { active: true };
        const upsert = { upsert: true }
        await User.findOneAndUpdate(query, newData, upsert);
        const accessToken = generateAccessToken(phone);
        const refreshToken = jwt.sign(phone, REFRESH_TOKEN);
        console.log("tokens", accessToken, refreshToken);
        // await Token.create({ refreshToken, phone })
        const token = { accessToken, refreshToken };
        sendResponse(false, "Logged in successful", res, 200, token);
    }
    catch (err) {
        console.log("verify::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}

export const sendMessage = async (req, res) => {
    try {
        await Chat.create(req.body);
        sendResponse(false, "message send", res, 200);
    }
    catch (err) {
        console.log("sendMessage::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}
export const getMessage = async (req, res) => {
    try {
        const { from, to, pagination, lastTime = 0 } = req.body;
        const query = {
            $and: [
                { $or: [{ from, to }, { from: to, to: from }] },
                { time: { $gt: lastTime } }
            ]
        }
        const result = await Chat.find(query).sort({ _id: -1 });
        sendResponse(false, "message send", res, 200, result);
    }
    catch (err) {
        console.log("getMessage::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}

export const getRecent = async (req, res) => {
    try {
        const from = req.user;
        if (!ContactList[from]) ContactList[from] = [];
        console.log("getRecent::from", from);
        const query = { $or: [{ from }, { to: from }] }
        const chats = await Chat.find(query).sort({ _id: -1 });
        const mappedData = {};
        chats.forEach(x => {
            if (x.from === from) {
                if (!mappedData[x.to]) mappedData[x.to] = []
                mappedData[x.to].push(x);
            }
            else {
                if (!mappedData[x.from]) mappedData[x.from] = []
                mappedData[x.from].push(x);
            }
        });
        ContactList[from] = Object.keys(mappedData)
        const lastMessage = Object.keys(mappedData).map((key) => mappedData[key][0])
        sendResponse(false, "", res, 200, lastMessage);
    }
    catch (err) {
        console.log("getRecent::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}

export const addToContact = async (req, res) => {
    try {
        const from = req.user;
        const { phone, name } = req.body;
        const contact = await Contact.create({ name, phone, from });
        sendResponse(false, "", res, 200, contact);
    }
    catch (err) {
        console.log("addToContact::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}

export const getMyContacts = async (req, res) => {
    try {
        const from = req.user;
        const contacts = await Contact.find({ from });
        contacts.forEach((contact) => {
            const { phone } = contact;
            if (ContactList[from] && !ContactList[from].includes(phone)) {
                ContactList[from].push(phone)
            }
        })
        sendResponse(false, "", res, 200, contacts);
    }
    catch (err) {
        console.log("getMyContacts::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}
export const updateProfilePic = async (req, url) => {
    try {
        const phone = req.user;
        const query = { phone }
        const newData = { profilePic: url };
        const upsert = { upsert: true }
        await User.findOneAndUpdate(query, newData, upsert);
    }
    catch (err) {
        console.log("getMyContacts::catch", err.message);
        throw err;
    }
}
export const updateLastSeen = async (req, res) => {
    try {
        const { phone } = req.body;
        const query = { phone }
        const lastseen = Date.now();
        const newData = { lastseen };
        const upsert = { upsert: true }
        await User.findOneAndUpdate(query, newData, upsert);
        sendResponse(false, "", res, 200);
    }
    catch (err) {
        console.log("updateLastSeen::catch", err.message);
        throw err;
    }
}
export const getLastSeen = async (req, res) => {
    try {
        const { phone } = req.body;
        const result = await User.find({ phone });
        sendResponse(false, "", res, 200, result);
    }
    catch (err) {
        console.log("getLastSeen::catch", err.message);
        throw err;
    }
}
export const getAllMyUserDetails = async (req, res) => {
    try {
        const from = req.user;
        console.log("contactlist", ContactList);

        if (ContactList && !ContactList[from] || ContactList[from].length == 0) {
            ContactList[from] = [];
            const query = { $or: [{ from }, { to: from }] }
            const chats = await Chat.find(query).sort({ _id: -1 });
            const mappedData = {};
            chats.forEach(x => {
                if (x.from === from) {
                    if (!mappedData[x.to]) mappedData[x.to] = []
                    mappedData[x.to].push(x);
                }
                else {
                    if (!mappedData[x.from]) mappedData[x.from] = []
                    mappedData[x.from].push(x);
                }
            });
            ContactList[from] = Object.keys(mappedData)
        }
        const contacts = await User.find({ phone: { $in: [from, ...ContactList[from]] } })
        sendResponse(false, "", res, 200, contacts);
    }
    catch (err) {
        console.log("getMyContacts::catch", err.message);
        sendResponse(true, 104, res, 500);
    }
}