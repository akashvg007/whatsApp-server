import { Router } from "express";

const router = Router();

router.get("/get", (req, res) => {
  req.setTimeout(500000);
  // appliedJob(req, res);
});

export default router;
