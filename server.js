const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

const users = {};
const messages = {};
const contacts = {};

io.on('connection', (socket) => {
    socket.on('join', (userId) => {
        socket.userId = userId;
        users[userId] = { socketId: socket.id, online: true };
    });
    
    socket.on('send-message', (data) => {
        const { chatId, message, sender, receiver } = data;
        if (!messages[chatId]) messages[chatId] = [];
        
        const msg = {
            id: Date.now().toString(),
            text: message,
            sender: sender,
            timestamp: Date.now(),
            read: false
        };
        messages[chatId].push(msg);
        
        const receiverSocket = users[receiver]?.socketId;
        if (receiverSocket) {
            io.to(receiverSocket).emit('new-message', { chatId, message: msg });
        }
        socket.emit('message-sent', { chatId, message: msg });
    });
});

http.listen(3000, () => console.log('Server running!'));
