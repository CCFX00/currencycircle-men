const TradeNotification = require('../models/tradeNotificationModel');

// Save notifications
exports.saveTradeNotification = async({  }) => {
    try{

    }catch(error){
        return { 
            success: false, 
            message: `Error fetching notifications: ${error.message}` 
        }
    }
}

// Get notifications by userId or roomId
exports.getNotifications = async ({ userId, roomId }) => {
    try {
        const filter = {};

        if (userId) filter.userId = userId;
        if (roomId) filter.roomId = roomId;

        // Find notifications that are not expired
        const notifications = await TradeNotification.find({
            ...filter,
            expiresAt: { $gt: Date.now() },
        });

        return {
            success: true,
            notifications,
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Error fetching notifications: ${error.message}` 
        }
    }
};
