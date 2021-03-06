import { Router } from "express";
import { sendResponse } from "../Response/Response";
import {
    registerOrLogin, verify, sendMessage, getRecent, addToContact, getMessage,
    getMyContacts, updateProfilePic, getAllMyUserDetails, updateLastSeen, getLastSeen
} from "../controller/controller";
import { uploadFileBuffer } from "../helper/s3";
import { authenticateToken } from "../middlewares/auth"
import multer from "multer";

const router = Router();

const fileStorageEngine = multer.memoryStorage({
    destination: (req, file, cb) => {
        cb(null, "");
    },
});
const upload = multer({ storage: fileStorageEngine }).single("file");

router.post("/register", (req, res) => {
    registerOrLogin(req, res);
});

router.post("/upload", authenticateToken, upload, async (req, res) => {
    try {
        const { file } = req;
        console.log("inside the upload file", file);
        const result = await uploadFileBuffer(file);
        await updateProfilePic(req, result?.Location)
        sendResponse(false, "", res, 200, { url: result?.Location });
    } catch (err) {
        console.log("err in catch::updatePhoto", err.message);
        sendResponse(true, 101, res, 500);
    }
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

router.get("/update-last-seen", authenticateToken, (req, res) => {
    updateLastSeen(req, res);
});

router.get("/get-last-seen", authenticateToken, (req, res) => {
    getLastSeen(req, res);
});

router.get("/getcontacts", authenticateToken, (req, res) => {
    getMyContacts(req, res);
});

router.get("/getAllMyUserDetails", authenticateToken, (req, res) => {
    getAllMyUserDetails(req, res);
});

export default router;
