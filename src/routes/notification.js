const notificationRouter = require("express").Router();

notificationRouter.get("/get", (req, res) => {
  req.setTimeout(500000);
  // appliedJob(req, res);
});

module.exports = notificationRouter;
