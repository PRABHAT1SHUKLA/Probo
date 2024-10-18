const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const redisClient = createClient();

app.use(express.json());

// Connect to Redis
redisClient.connect().catch(console.error);

// Endpoint to handle user requests
app.post('/request', async (req, res) => {
    const { userId, requestData } = req.body;
    if (!userId || !requestData) {
        return res.status(400).json({ error: 'userId and requestData are required' });
    }

    // Publish the user request to the Redis queue
    await redisClient.publish('requestQueue', JSON.stringify({ userId, requestData }));
    res.json({ message: 'Request received', userId });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for real-time updates
    redisClient.subscribe('requestQueue');
    redisClient.on('message', (channel, message) => {
        const data = JSON.parse(message);
        socket.emit('result', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`API Server is running on http://localhost:${PORT}`);
});
