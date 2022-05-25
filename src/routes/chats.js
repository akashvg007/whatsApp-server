const chatRouter = require("express").Router();
const ChatModel = require("../models/chat");

chatRouter.get("/delete/:mob", async (req, res) => {
  const { mob } = req.params;
  const query = { $or: [{ from: mob }, { to: mob }] };
  const result = await ChatModel.deleteMany(query);
  res.json({ text: "deleted successfull", data: result });
});

module.exports = chatRouter;
