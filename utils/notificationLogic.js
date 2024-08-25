const Notification = require('../models/notificationModel')
const { acceptOffer, declineOffer } = require('./offersHelper')

// Function to send a notification
exports.sendNotification = async (senderId, receiverId, message) => {
    try {
        const notification = new Notification({
            sender: senderId,
            receiver: receiverId,
            message
        })
        await notification.save()
        return notification
    } catch (error) {
        console.error('Error sending notification:', error)
        throw error
    }
}

// Function to get unread notifications for a user
exports.getUnreadNotifications = async (userId) => {
    try {
        return await Notification.find({ receiver: userId, isRead: false })
    } catch (error) {
        console.error('Error retrieving notifications:', error)
        throw error
    }
}

// Function to mark a notification as read and handle offer acceptance/decline
exports.markAsRead = async (notificationId, action, userId, offerId) => {
    try {
        // Mark the notification as read
        await Notification.findByIdAndUpdate(notificationId, { isRead: true });

        // Check if an action is provided and handle offer acceptance/decline
        if (action && offerId) {
            if (action === 'accept') {
                await acceptOffer(userId, offerId)
            } else if (action === 'decline') {
                await declineOffer(userId, offerId)
            }
        }
    } catch (error) {
        console.error('Error marking notification as read or updating offer status:', error);
        throw error;
    }
}
