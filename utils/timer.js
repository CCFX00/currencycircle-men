const TradeCountdown = require('../models/tradeCountdownModel');
const TradeStatus = require('../models/tradeStatusModel');
const MatchedOfferStatus = require('../models/matchedOfferStatusModel');


// Countdown function for trade expiration
exports.startTradeCountdown = async ({ io, tradeId, receiverSocketId }) => {
    try {
        // Set expiration time to 48 hours from now
        const expirationDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
        await TradeCountdown.create({
            tradeId,
            expiresAt: expirationDate,
        });

        // Sending the notification to the counterpay ( ...ensuring that the notification is stored in the database)
        sendRealTimeNotification(io, receiverSocketId, 'Reminder: Your offer has been accepted, you have 48 hours left to complete the trade');

        // Start a 24-hour reminder
        setTimeout(async () => {
            await TradeCountdown.updateOne({ tradeId }, { status24: 'expired' });

            sendRealTimeNotification(io, receiverSocketId, 'Reminder: 24 hours left to complete the trade');

        }, 24 * 60 * 60 * 1000);

        // Expire the trade after 48 hours
        setTimeout(async () => {
            const countdown = await TradeCountdown.findOne({ tradeId });

            if (countdown && countdown.status48 === 'active') {

                // Trade expires if both users haven't completed
                await MatchedOfferStatus.findByIdAndDelete(tradeId); // Trade goes back to the marketplace
                
                sendRealTimeNotification(io, receiverSocketId, 'Trade expired and is returned to the marketplace');

            }
            await TradeCountdown.updateOne({ tradeId }, { status48: 'expired' });
        }, 48 * 60 * 60 * 1000);

    } catch (error) {
        console.error(`Error starting countdown for trade ${tradeId}: ${error.message}`);
    }
};


// Helper function to send a real-time notification
function sendRealTimeNotification(io, socketId, message) {
    if (socketId) io.to(socketId).emit('newNotification', message);
}