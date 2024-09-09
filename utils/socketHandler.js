const notificationLogic = require('./notificationLogic')

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


        // Try catch block to handle asynchronous operations like database queries
        try {
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
