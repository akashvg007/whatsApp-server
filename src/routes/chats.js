import { Router } from "express";
import Chat from "../models/chat"

const router = Router();

router.get("/delete/:mob", async (req, res) => {
    const { mob } = req.params;
    const query = { $or: [{ from: mob }, { to: mob }] }
    const result = await Chat.deleteMany(query);
    res.json({ text: 'deleted successfull', data: result })
});


export default router;
