// Save a new notification
exports.saveNotification = async (data) => {
    try {
        const notification = new TradeNotification({
            ...data,
            createdAt: Date.now(),
            expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Set expiry to 2 days from now
        });
        await notification.save();
        return notification;
    } catch (error) {
        throw new Error(`Error saving notification: ${error.message}`);
    }
};

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
