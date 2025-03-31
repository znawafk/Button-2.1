const express = require('express');
const socketIo = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = {};
let buttonPressed = false;
let winner = null;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.on('connection', (socket) => {
    console.log('New user connected');
    
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
    
    socket.on('disconnect', () => {
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));