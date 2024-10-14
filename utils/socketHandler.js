const notificationLogic = require('../controllers/notificationController')
const ChatController = require('../controllers/chatController');

// Create a Map to store userId and socketId pairs
const userSocketMap = new Map()

// Function to extract user's socketId
function getUserSocketId(id){
    return userSocketMap.get(id)
}

module.exports = function(io) {
    io.on("connection", async (socket) => {
        const userId = socket.handshake.query.userId

        // Store the userId and socketId in the Map
        userSocketMap.set(userId, socket.id)

        const userSocketId = getUserSocketId(userId)

        socket.join(userSocketId) // Join a room for the user based on their socketIDs
        console.log("A user connected with id " + userId + " and socket id " + socket.id)

        try {
            // ======================
            // Notification Logic
            // ======================

            // Listen for new notifications to send in real-time
            socket.on("sendNotification", async (data) => {
                const notification = await notificationLogic.sendNotification(data)
                recieverSocketId = getUserSocketId(data.recieverId)
                io.to(recieverSocketId).emit('newNotification', notification)
            })  

            // Check if offer has any notifications, to ensure that the corresponding user gets the notification
            socket.on('checkNotification', async (data) => {
                const notifications = await notificationLogic.checkNotification(data)
                socket.emit('recieveNotification', notifications)
            })

            // Fetch notifications for the connected user
            socket.on('fetchNotifications', async () => {
                const notifications = await notificationLogic.getNotifications(userId)
                socket.emit('notifications', notifications)
            })

            // Accepting an offer
            socket.on('acceptOffer', async (data) => {
                await notificationLogic.markAsRead(data)
                // io.to(matchedOfferOwnerId).emit('offerAccepted', {});
            })
    
            // Declining an offer
            socket.on('declineOffer', async (data) => {
                await notificationLogic.markAsRead(data)
                // io.to(matchedOfferOwnerId).emit('offerDeclined', {});
            })


            // ======================
            // Chat Logic
            // ======================

            // Join a chat room (roomId can be a combination of user IDs)
            socket.on('chatMessage', async (msgData) => {
                const { roomId, message, senderId } = msgData;
                
                // Save the message via the chat controller
                const savedMessage = await ChatController.saveMessage(roomId, senderId, message);

                // Broadcast the message to everyone in the room
                io.to(roomId).emit('message', savedMessage);
            });

            // Fetch chat history for a specific room
            socket.on('fetchChatHistory', async (roomId) => {
                const chatHistory = await ChatController.getChatHistory(roomId);
                socket.emit('chatHistory', chatHistory);
            });

        } catch (error) {
            console.error('Error handling notifications:', error)
        }  
        // Handle logout event
        socket.on('userLogout', () => {
            console.log(`User ${userId} is logged out`)
            socket.disconnect()
        })
    })
}
