const TradeCountdown = require('../models/tradeCountdownModel');
const MatchedOfferStatus = require('../models/matchedOfferStatusModel');
const TradeStatus = require('../models/tradeStatusModel');


// Countdown function for trade expiration
exports.startTradeCountdown = async ({ io, tradeId, receiverSocketId, userSocketId }) => {
    try {       
        // Storing the trade countdown information
        await TradeCountdown.create({
            tradeId,
            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),  // Set expiration time to 48 hours from now
        });

        // Start a 24-hour reminder
        setTimeout(async () => {
            await TradeCountdown.updateOne({ tradeId }, { status24: 'expired' });
            const message = {text: 'Reminder: 24 hours left to complete the trade', trade: true}

            const tradeStatus = await TradeStatus.findOne({ tradeId });

            if(tradeStatus.status === 'completed'){
                return
            }else if(tradeStatus.status === 'pendingPartial'){
                if(tradeStatus.senderCompleted === true && tradeStatus.receiverCompleted === false){

                }else if(tradeStatus.senderCompleted === false && tradeStatus.receiverCompleted === true){

                }
            }

            sendRealTimeNotification(io, userSocketId, message);
            sendRealTimeNotification(io, receiverSocketId, message);

        }, 24 * 60 * 60 * 1000);

        // Expire the trade after 48 hours
        setTimeout(async () => {
            const countdown = await TradeCountdown.findOne({ tradeId });

            if (countdown && countdown.status48 === 'active') {
                const tradeStatus = await TradeStatus.findOne({ tradeId });

                if(tradeStatus.status === 'completed'){
                    return
                }

                // Trade expires if both users haven't completed
                await MatchedOfferStatus.findByIdAndDelete({ tradeId }); // Trade goes back to the marketplace
                await TradeStatus.findByIdAndDelete({ tradeId }); // Deleting Trade status document

                const message = {text: 'Trade expired and is returned to the marketplace', trade: true}
                
                sendRealTimeNotification(io, userSocketId, message);
                sendRealTimeNotification(io, receiverSocketId, message);

            }
            // await TradeCountdown.updateOne({ tradeId }, { status48: 'expired' });
            await TradeCountdown.findByIdAndDelete({ tradeId }); // Deleting Trade countdown document
        }, 48 * 60 * 60 * 1000);

    } catch (error) {
        console.error(`Error starting countdown for trade ${tradeId}: ${error.message}`);
    }
};


// Helper function to send a real-time notification
function sendRealTimeNotification(io, socketId, message) {
    if (socketId) io.to(socketId).emit('newNotification', message);
}