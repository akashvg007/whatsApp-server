import Razorpay from "razorpay";
import { Router } from "express";
import { config } from "dotenv";

const router = Router();
config({ path: ".env" });

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const rpayInstance = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

router.post("/purchase_plan", (req, res) => {
  // activatePlan(req, res, rpayInstance);
});

export default router;
