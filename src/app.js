
import express from "express";
import { config } from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import user from "./routes/user"

// configurations and port
config({ path: ".env" });
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const port = process.env.PORT || 3000;
const io = new Server(server);

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

io.on('connection', socket => {
    const id = socket.handshake.query.id
    socket.join(id)

    socket.on('send-message', ({ recipient, text }) => {
        console.log("message::text", recipient, text);

        socket.broadcast.to(recipient).emit('receive-message', {
            recipient, sender: id, text
        })
    })
})

//route middleware
app.use("/user", user);


// routes
app.get("/", (req, res) => {
    res.send("welcome whatsapp server");
});


// server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
