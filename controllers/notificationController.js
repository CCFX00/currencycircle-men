const Notification = require('../models/notificationModel')
const { acceptOffer, declineOffer } = require('./offersController')

// Function to send a notification
exports.sendNotification = async ({ senderId, recieverId, offerId, message, matchFee }) => {
    try {
        const notification = new Notification({
            senderId,
            recieverId,
            offerId,
            message,
            matchFee
        })
        await notification.save()
        return notification
    } catch (error) {
        console.error('Error sending notification:', error)
        throw error
    }
}

// Function to get unread notifications for a user
exports.getNotifications = async (userId) => {
    try {
        return await Notification.find({ 
            recieverId: userId 
        })
    } catch (error) {
        console.error('Error retrieving notifications:', error)
        throw error
    }
}

// Function to get unread notifications for a user
exports.checkNotification = async ({ offerId }) => {
    try {
        return await Notification.find({ 
            offerId
        })
    } catch (error) {
        console.error('Error retrieving notifications:', error)
        throw error
    }
}

// Function to mark a notification as read and handle offer acceptance/decline
exports.markAsRead = async ({ userId, userOfferId, matchedOfferId, matchedOfferOwnerId, action }) => {
    try {
        // Find both notifications related to the offer
        const notification = await Notification.findOne({
            senderId: matchedOfferOwnerId, recieverId: userId, offerId: matchedOfferId
        });

        if (!notification) {
            console.error('No notifications found for the given criteria');
            return;
        }

        notification.isRead = true

        // Handle offer acceptance or decline
        if (action === 'accept') {
            notification.isAccepted = true;
            await acceptOffer(userId, userOfferId, matchedOfferId, matchedOfferOwnerId);
        } else if (action === 'decline') {
            notification.isAccepted = false;
            await declineOffer(userId, userOfferId, matchedOfferId, matchedOfferOwnerId);
        }

        // Save the updated notification document
        await notification.save();
    } catch (error) {
        console.error('Error marking notification as read or updating offer status:', error);
        throw error;
    }
}
