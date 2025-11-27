require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require("./src/config/db");

// Models
require('./src/models/User');
require('./src/models/Project');
require('./src/models/Repo');
require('./src/models/Ticket');

// Routes
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const ticketRoutes = require('./src/routes/ticketRoutes');
const repoRoutes = require('./src/routes/repoRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

//////////////////////// SOCKET.IO — REALTIME LAYER ////////////////////////
const io = new Server(server, { cors: { origin: "*" }});
module.exports.ioInstance = io;
io.on("connection", socket => {
    console.log("⚡ User connected:", socket.id);

    socket.on("joinUser", userId => {
        socket.join(`user:${userId}`);
        console.log(`🔵 User joined room → user:${userId}`);
    });

    socket.on("joinProject", projectId => {
        socket.join(`project:${projectId}`);
        console.log(`🟢 Project joined → project:${projectId}`);
    });

    socket.on("fileUpdate", ({ projectId, filename, content }) => {
        socket.to(`project:${projectId}`).emit("fileUpdated", { filename, content });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});

/// ONLY THIS — clean export  (boshqa exportsni o‘chir)
module.exports.io = io;
///////////////////////////////////////////////////////////////////////////

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use('/auth', authRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/user', userRoutes);
app.use('/projects', authMiddleware, projectRoutes);
app.use('/repo', authMiddleware, repoRoutes);
app.use('/tickets', authMiddleware, ticketRoutes);
app.use('/notifications', authMiddleware, notificationRoutes);

const PORT = process.env.PORT || 7777;

connectDB(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB Connected");
    server.listen(PORT, () =>
        console.log(`SERVER + SOCKET is running on PORT ${PORT}`)
    );
})
.catch(err => {
    console.log(err);
    process.exit(1);
});