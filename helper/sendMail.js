import nodemailer from "nodemailer";
import { config } from "dotenv";

config({ path: ".env" });

export const sendMails = async (options) => {
  try {
    return new Promise((res, rej) => {
      const { MAIL_SERVICE, MAIL_AUTH_USER, MAIL_AUTH_PASS } = process.env;
      const transporterGmail = nodemailer.createTransport({
        service: MAIL_SERVICE,
        auth: {
          user: MAIL_AUTH_USER,
          pass: MAIL_AUTH_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
      console.log("sendMails::service::user::password", MAIL_SERVICE, MAIL_AUTH_USER, MAIL_AUTH_PASS);
      transporterGmail.sendMail(options, (error, info) => {
        if (error) {
          console.log("sendMails::error", error);
          rej(error)
        }
        console.log("Message sent: %s", info);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        res(info);
      });
    })
  } catch (err) {
    console.log("something went wrong", err.message);
    return {};
  }
};
