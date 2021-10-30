import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();
const { ACCESS_TOKEN_SECRED } = process.env;

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    console.log("token::", token);
    if (!token) return res.sendStatus(401);
    jwt.verify(token, ACCESS_TOKEN_SECRED, (err, data) => {
      console.log("authenticateToekn::verify::Err", err);
      if (err) return res.sendStatus(400);
      console.log("authenticateToekn::user", data);
      req.user = data.user;
      req.type = data.type;
      next();
    });
  } catch (err) {
    console.log("authenticateToken::catch", err.message);
    res.send(err.message);
  }
};
