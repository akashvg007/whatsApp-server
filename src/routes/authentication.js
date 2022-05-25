const router = require("express").Router();
require("dotenv").config({ path: ".env" });
const { encryptPassword } = require("../helper/authHelper");

router.post("/getAHash", async (req, res) => {
  const { pass } = req.body;
  const hash = await encryptPassword(pass);
  res.send(hash);
});

module.exports = router;
