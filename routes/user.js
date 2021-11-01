import { Router } from "express";
import { registerOrLogin, verify, sendMessage, getRecent } from "../controller/controller";
import { authenticateToken } from "../middlewares/auth"

const router = Router();
router.post("/register", (req, res) => {
    registerOrLogin(req, res);
});

router.post("/verify", (req, res) => {
    verify(req, res);
});

router.post("/send-msg", (req, res) => {
    sendMessage(req, res);
});

router.post("/get-msg", (req, res) => {
    sendMessage(req, res);
});

router.get("/getrecent", authenticateToken, (req, res) => {
    getRecent(req, res);
});

export default router;
