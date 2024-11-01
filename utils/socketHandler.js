const notificationLogic = require('../controllers/matchNotificationController')
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

            // (Notification Logic) Listen for new notifications to send in real-time
            //======================================================================//
            socket.on("sendNotification", async (data) => {
                const notification = await notificationLogic.sendMatchNotification(data)
                receiverSocketId = getUserSocketId(data.recieverId)
                io.to(receiverSocketId).emit('newNotification', notification)
            })  

            // Check if offer has any notifications, to ensure that the corresponding user gets the notification
            socket.on('checkNotification', async (data) => {
                const notifications = await notificationLogic.checkMatchNotification(data)
                socket.emit('recieveNotification', notifications)
            })

            // Fetch notifications for the connected user
            socket.on('fetchNotifications', async () => {
                const notifications = await notificationLogic.getMatchNotifications(userId)
                socket.emit('notifications', notifications)
            })

            // Accepting an offer
            socket.on('acceptOffer', async (data) => {
                receiverSocketId = getUserSocketId(data.matchedOfferOwnerId) // Extracting receiver's socketId
                await notificationLogic.markMatchNotificationAsRead({ ...data, io, receiverSocketId })
            })
    
            // Declining an offer
            socket.on('declineOffer', async (data) => {
                receiverSocketId = getUserSocketId(data.matchedOfferOwnerId) // Extracting receiver's socketId
                await notificationLogic.markMatchNotificationAsRead({ ...data, io, receiverSocketId })
            })


            // (Chat Logic) Join chat room and fetch it's chat history 
            //========================================================//
            socket.on('joinRoom', async ({ roomId, senderName: userName }) => {
                // Leave all other rooms except the default room (socket.id)
                for (let room of socket.rooms) {
                    if (room !== socket.id && room !== roomId) {
                        socket.leave(room);
                        io.to(roomId).emit('userLeft', { userId, message: `User ${userName} has left the chat room: ${roomId}` })
                    }
                }
            
                // Check if the user is not already in the room
                if (!socket.rooms.has(roomId)) {
                    socket.join(roomId);
                    console.log(`User: ${userId} has joined room: ${roomId}`);               
                    const chatHistory = await ChatController.getChatHistory(roomId);
                    socket.emit('chatHistory', chatHistory);   
                    
                    // Check for notifications

                } else {
                    console.log(`User: ${userId} is already in room: ${roomId}`);
                }
            });                      

            // Save messages
            socket.on('saveMessage', async (data) => {
                data = { ...data, userId }
                const { success, message, savedMessage } = await ChatController.saveMessage(data)

                // Send error message if it contains profanity
                if (success === false){
                    socket.emit('error', {message});                     
                    return
                }
 
                // Broadcast the saved message to everyone in the room
                io.to(data.roomId).emit('newMessage', savedMessage)
            })

            // Show activity
            socket.on('typing', async({ roomId, senderName })=>{
                // socket.to(roomId).broadcast.emit('typing', { senderName });
                socket.to(roomId).emit('typing', { senderName });
            })

            // Leave chat room
            socket.on('leaveRoom', async ({ roomId, senderName: userName }) => {
                socket.leave(roomId) // User leaves the specified room

                // Optionally notify other users in the room
                io.to(roomId).emit('userLeft', { userId, message: `User ${userName} has left the chat room: ${roomId}` })
            })


            // Complete | Withdraw from trade | Notification handling
            //=======================================================

            // Handle trade completion
            socket.on('markTradeComplete', ({ roomId, tradeId, senderId, senderName, action }) => {
                if (tradeId) {
                    
                    if(action === 'sender'){
                        
                        socket.to(roomId).emit('completeTradeNotif', { senderName, from: 'sender', message: 'hello there' });
                    }
                    
                    if(action === 'receiver'){

                        // socket.to(roomId).emit('completeTradeNotif', { senderName, from: 'receiver' });
                    }          
                }
            });

            // Handle withdraw from trade or Cancel trade
            socket.on('withdrawTrade', ({ roomId, tradeId, senderId, senderName, action }) => {
                if (tradeId) {
                    if(action === 'sender') {

                        
                        socket.to(roomId).emit('withdrawTradeNotification', { senderName });
                    }
                }
            });
                
        } catch (error) {
            console.error('Error handling notifications:', error)
        }  
        
        // Handle logout event
        socket.on('userLogout', () => {
            userSocketMap.delete(userId)
            socket.disconnect()
            console.log(`User ${userId} is logged out`)       
        })
    })
}
