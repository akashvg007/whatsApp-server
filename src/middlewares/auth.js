const jwt = require("jsonwebtoken");
require("dotenv").config({ path: ".env" });

const { ACCESS_TOKEN_SECRED } = process.env;

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    console.log("token::", token);
    if (!token) return res.sendStatus(401);
    jwt.verify(token, ACCESS_TOKEN_SECRED, (err, data) => {
      if (err) return res.sendStatus(400);
      console.log("authenticateToekn::user", data);
      req.user = data.user;
      next();
    });
  } catch (err) {
    console.log("authenticateToken::catch", err.message);
    res.send(err.message);
  }
};

module.exports = {
  authenticateToken,
};
