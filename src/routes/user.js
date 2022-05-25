const userRouter = require("express").Router();
const responseMgr = require("../Response/Response");
const {
  registerOrLogin,
  verify,
  sendMessage,
  getRecent,
  addToContact,
  getMessage,
  getMyContacts,
  updateProfilePic,
  getAllMyUserDetails,
  updateLastSeen,
  getLastSeen,
  getAllMyUsers,
  updateNameAndDP,
  removeProfilePic,
  updateStatus,
  updateNotificationToken,
  updateImage,
  uploadImage,
} = require("../controller/controller");
const { uploadFileBuffer } = require("../helper/s3");
const { authenticateToken } = require("../middlewares/auth");
const multer = require("multer");

const fileStorageEngine = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
});
const upload = multer({ storage: fileStorageEngine }).single("file");

userRouter.post("/register", (req, res) => {
  registerOrLogin(req, res);
});

userRouter.post("/update_image", upload, (req, res) => {
  updateImage(req, res);
});

userRouter.post("/upload/file", upload, (req, res) => {
  uploadImage(req, res);
});

userRouter.post("/upload", authenticateToken, upload, async (req, res) => {
  try {
    const { file } = req;
    console.log("inside the upload file", file);
    const result = await uploadFileBuffer(file);
    await updateProfilePic(req, result?.Location);
    responseMgr(false, "", res, 200, { url: result?.Location });
  } catch (err) {
    console.log("err in catch::updatePhoto", err.message);
    responseMgr(true, 101, res, 500);
  }
});

userRouter.get("/update/status/:from", authenticateToken, (req, res) => {
  updateStatus(req, res);
});

userRouter.post("/update/name", (req, res) => {
  updateNameAndDP(req, res);
});

userRouter.post("/update/notification/token", (req, res) => {
  updateNotificationToken(req, res);
});

userRouter.post("/verify", (req, res) => {
  verify(req, res);
});

userRouter.post("/getAllContacts", (req, res) => {
  getAllMyUsers(req, res);
});

userRouter.post("/send-msg", authenticateToken, (req, res) => {
  sendMessage(req, res);
});

userRouter.post("/get-msg", authenticateToken, (req, res) => {
  getMessage(req, res);
});
userRouter.post("/addcontact", authenticateToken, (req, res) => {
  addToContact(req, res);
});

userRouter.get("/getrecent", authenticateToken, (req, res) => {
  getRecent(req, res);
});

userRouter.get("/remove/profile", authenticateToken, (req, res) => {
  removeProfilePic(req, res);
});

userRouter.get("/getrecent/:lastTime", authenticateToken, (req, res) => {
  getRecent(req, res);
});

userRouter.post("/update-last-seen", authenticateToken, (req, res) => {
  updateLastSeen(req, res);
});

userRouter.post("/get-last-seen", authenticateToken, (req, res) => {
  getLastSeen(req, res);
});

userRouter.get("/getcontacts", authenticateToken, (req, res) => {
  getMyContacts(req, res);
});

userRouter.get("/getAllMyUserDetails", authenticateToken, (req, res) => {
  getAllMyUserDetails(req, res);
});

module.exports = userRouter;
