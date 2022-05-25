const sendResponse = require("../Response/Response");
require("dotenv").config({ path: ".env" });

const client = require("twilio")(process.env.ACC_SID, process.env.AUTH_TOKEN);
const serviceId = process.env.SERVICE_ID;

const sendVerificationMessage = async (res, mobile) => {
  try {
    const createObj = { to: mobile, channel: "sms" };
    const data = await client.verify
      .services(serviceId)
      .verifications.create(createObj);
    return data;
  } catch (err) {
    console.log("sendOTP::catch", err.message);
    sendResponse(true, 103, res, 500);
  }
};

const verifyPhoneNumber = async (res, payload) => {
  try {
    const data = await client.verify
      .services(serviceId)
      .verificationChecks.create(payload);
    return data;
  } catch (err) {
    console.log("verifyOTP::catch", err.message);
    sendResponse(true, 104, res, 500);
  }
};

const verifyToken = (refreshTk, dbResult) => {
  if (!dbResult || !Array.isArray(dbResult) || dbResult.length === 0) {
    return false;
  }
  const token = dbResult[0].refresh_token;
  if (refreshTk !== token) return false;
  return true;
};

module.exports = {
  sendOTP: sendVerificationMessage,
  verifyOTP: verifyPhoneNumber,
  checkToken: verifyToken,
};
