import { Router } from "express";
import { config } from "dotenv";
import { encryptPassword } from "../helper/authHelper"

const router = Router();

config({ path: ".env" });

router.post("/getAHash", async (req, res) => {
  const { pass } = req.body;
  const hash = await encryptPassword(pass);
  res.send(hash)
});


export default router;
