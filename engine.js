const { createClient } = require('redis');

// Connect to Redis
const redisClient = createClient();

const processRequest = async (message) => {
    const { userId, requestData } = message;

    // Simulate some processing
    console.log(`Processing request for userId: ${userId}, data: ${requestData}`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulating processing time

    // Publish the result back to the channel
    const result = { userId, result: `Processed ${requestData}` };
    await redisClient.publish('resultChannel', JSON.stringify(result));
};

// Listen to the Redis queue for incoming requests
const listenToQueue = () => {
    redisClient.on('message', async (channel, message) => {
        if (channel === 'requestQueue') {
            const requestData = JSON.parse(message);
            await processRequest(requestData);
        }
    });
};

const startEngine = async () => {
    await redisClient.connect();
    await redisClient.subscribe('requestQueue'); // Subscribe to the request queue
    listenToQueue(); // Start listening to the queue
};

startEngine().catch(console.error);
