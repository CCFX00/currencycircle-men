const notificationLogic = require('./notificationLogic')

module.exports = function(io) {
    io.on("connection", async (socket) => {
        console.log("A user connected")

        const userId = socket.handshake.query.userId;
        socket.join(userId) // Join a room for the user based on their ID

        try {
            // Fetch unread notifications when the user connects
            const unreadNotifications = await notificationLogic.getUnreadNotifications(userId)

            // Send all unread notifications to the user
            unreadNotifications.forEach(notification => {
                socket.emit("receiveNotification", notification)
            })

            // Listen for new notifications to send in real-time
            socket.on("sendNotification", async ({ receiverId, message }) => {
                const notification = await notificationLogic.sendNotification(userId, receiverId, message)
                
                // If the receiver is connected, send the notification in real-time
                io.to(receiverId).emit("receiveNotification", notification)
            })
        } catch (error) {
            console.error('Error handling notifications:', error)
        }

        // // Handle user accepting the proposal
        // socket.on("acceptProposal", async ({ senderId }) => {
        //     // Logic to handle acceptance and start chat
        //     console.log(`${userId} accepted the proposal from ${senderId}`)
        // })

        // Handle user disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected')
        })
    })
}
