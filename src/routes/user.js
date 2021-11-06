import { Router } from "express";
import {
    registerOrLogin, verify, sendMessage, getRecent, addToContact, getMessage,
    getMyContacts
} from "../controller/controller";
import { authenticateToken } from "../middlewares/auth"

const router = Router();
router.post("/register", (req, res) => {
    registerOrLogin(req, res);
});

router.post("/verify", (req, res) => {
    verify(req, res);
});

router.post("/send-msg", authenticateToken, (req, res) => {
    sendMessage(req, res);
});

router.post("/get-msg", authenticateToken, (req, res) => {
    getMessage(req, res);
});
router.post("/addcontact", authenticateToken, (req, res) => {
    addToContact(req, res);
});

router.get("/getrecent", authenticateToken, (req, res) => {
    getRecent(req, res);
});

router.get("/getcontacts", authenticateToken, (req, res) => {
    getMyContacts(req, res);
});

export default router;
