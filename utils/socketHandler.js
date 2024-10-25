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

            // (Notification Logic) Listen for new notifications to send in real-time
            //======================================================================//
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
                    // console.log(`User: ${userId} has joined room: ${roomId}`);               
                    const chatHistory = await ChatController.getChatHistory(roomId);
                    socket.emit('chatHistory', chatHistory);                    
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
            socket.on('markTradeComplete', (data) => {
                // Assuming you have trade details such as tradeId, etc.
                console.log('Trade marked as complete by:', socket.id);

                // You can do additional logic here, such as updating the trade status in the database
                const tradeId = data.tradeId;  // Get trade ID from client data
                if (tradeId) {
                    // Update trade status in database (pseudo-code)
                    // await TradeModel.update({ status: 'completed' }, { where: { id: tradeId } });

                    // Notify other involved users
                    socket.to(data.counterpartySocketId).emit('tradeCompleteNotification', {
                        message: 'The trade has been marked as complete.'
                    });

                    console.log(`Trade ${tradeId} marked as complete.`);
                }
            });

            // Handle withdraw from trade
            socket.on('withdrawTrade', (data) => {
                console.log('Trade withdrawal initiated by:', socket.id);

                const tradeId = data.tradeId;  // Example tradeId passed from client
                if (tradeId) {
                    // Handle trade withdrawal (pseudo-code)
                    // await TradeModel.update({ status: 'withdrawn' }, { where: { id: tradeId } });

                    // Notify other users involved in the trade
                    socket.to(data.counterpartySocketId).emit('withdrawNotification', {
                        message: 'Your trade partner has withdrawn from the trade.',
                    });

                    console.log(`User ${socket.id} withdrew from trade ${tradeId}.`);
                }
            });

            // Handle withdrawal notification from trade
            socket.on('withdrawTradeNotification', (data) => {
                console.log('Withdrawal notification received for trade:', data.tradeId);

                // Notify the user that their counterparty wants to withdraw from the trade
                socket.to(data.counterpartySocketId).emit('withdrawTradeRequest', {
                    message: 'Your counterparty wants to withdraw from the trade.',
                });

                console.log(`Withdrawal request notification sent to counterparty for trade ${data.tradeId}.`);
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
