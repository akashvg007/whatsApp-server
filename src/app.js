
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import user from "./routes/user"
import chats from "./routes/chats"

// configurations and port
config({ path: ".env" });
const app = express();
const port = process.env.PORT || 3000;

// connect db
const DB = 'mongodb+srv://root:root@mallucoder.fhzzu.mongodb.net/whatsapp?retryWrites=true&w=majority'
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
mongoose.connect(DB, options)
    .then(() => console.log('connection successfuly'))
    .catch(err => console.log("connection failed", err))

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//route middleware
app.use("/user", user);
app.use("/chat", chats);


// routes
app.get("/", (req, res) => {
    res.send("welcome whatsapp server");
});


// server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
