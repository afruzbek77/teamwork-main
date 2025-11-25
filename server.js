require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require("./src/config/db");

// Models
require('./src/models/User');
require('./src/models/Project');
require('./src/models/Repo'); // agar repo modeli ishlatilsa

// Routes
const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const repoRoutes = require('./src/routes/repoRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authMiddleware = require('./src/middleware/authMiddleware');

const app = express();
const server = http.createServer(app);

// Socket.io
const io = new Server(server, { cors: { origin: "*" } });

// Socket.io eventlari
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  socket.on('fileUpdate', ({ projectId, filename, content }) => {
    // Loyihaga ulangan boshqa foydalanuvchilarga yuborish
    socket.to(projectId).emit('fileUpdated', { filename, content });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/profile', authMiddleware, profileRoutes);
app.use('/user', userRoutes);
app.use('/projects', authMiddleware, projectRoutes);
app.use('/repo', authMiddleware, repoRoutes);

const PORT = process.env.PORT || 7777;

connectDB(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

// Socket.io ni boshqa fayllarda ishlatish uchun export qilish
module.exports = io;