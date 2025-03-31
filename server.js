const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure server to use Render's PORT or default to 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
});

// Enhanced Socket.io configuration for Render/Glitch compatibility
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true  // For older Socket.io clients
});

// Game state variables
let users = {};
let buttonPressed = false;
let winner = null;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  socket.on('register', (userData) => {
    users[socket.id] = userData;
    socket.emit('update', { buttonPressed, winner });
    if (userData.role === 'admin') {
      socket.emit('adminUpdate', users);
    }
  });
  
  socket.on('pressButton', () => {
    if (!buttonPressed) {
      buttonPressed = true;
      winner = users[socket.id].name;
      io.emit('buttonPressed', winner);
      io.emit('update', { buttonPressed, winner });
    }
  });
  
  socket.on('resetGame', () => {
    buttonPressed = false;
    winner = null;
    io.emit('gameReset');
    io.emit('update', { buttonPressed, winner });
  });
  
  socket.on('disconnect', () => {
    delete users[socket.id];
    console.log('User disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});
