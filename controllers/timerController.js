const TradeCountdown = require('../models/tradeCountdownModel');
const MatchedOfferStatus = require('../models/matchedOfferStatusModel');
const TradeStatus = require('../models/tradeStatusModel');
const { sendSMS } = require('../utils/smsLogic')
const { sendMail, genMail } = require('../utils/mailLogic')


// Countdown function for trade expiration
exports.startTradeCountdown = async ({ io, tradeId, receiverSocketId, userSocketId }) => {
    try {       
        // Storing the trade countdown information
        await TradeCountdown.create({
            tradeId,
            expiresAt: new Date(Date.now() + 49 * 60 * 60 * 1000),  // Set expiration time to 48 hours from now
        });

        let smsText = ``
        let mailText = ``

        // Start a 24-hour reminder
        setTimeout(async () => {
            await TradeCountdown.updateOne({ tradeId }, { status24: 'expired' });

            const tradeStatus = await TradeStatus.findOne({ tradeId })
            .populate([
                { path: 'senderId', select: 'userName phoneNumber email' },
                { path: 'receiverId', select: 'userName phoneNumber email' }
            ]);

            if(tradeStatus.status === 'completed'){
                return
            }else if(tradeStatus.status === 'pendingPartial'){
                if(tradeStatus.senderCompleted === true && tradeStatus.receiverCompleted === false){
                    smsText = `CCFX Reminder:\nHello ${tradeStatus.receiverId.userName}, \n${tradeStatus.senderId.userName} has completed the trade.\nYou have 24 hours left to complete the trade`
                    mailText = `
                        <p>Hello ${tradeStatus.receiverId.userName},</p>
                        <p><br/>${tradeStatus.senderId.userName} has completed the trade.\nYou have 24 hours left to complete the trade</p>
                    `
                    // Sending SMS and Email Notification to Receiver
                    sendSMS(tradeStatus.receiverId.phoneNumber, smsText)
                    sendUserEmail(tradeStatus.receiverId, mailText)

                    sendRealTimeNotification(io, receiverSocketId, { smsText, trade: true })
                }else if(tradeStatus.senderCompleted === false && tradeStatus.receiverCompleted === true){
                    smsText = `CCFX Reminder:\nHello ${tradeStatus.senderId.userName}, \n${tradeStatus.receiverId.userName} has completed the trade.\nYou have 24 hours left to complete the trade`
                    mailText = `
                        <p>Hello ${tradeStatus.senderId.userName},</p>
                        <p><br/>${tradeStatus.receiverId.userName} has completed the trade.\nYou have 24 hours left to complete the trade</p>
                    `
                    
                    // Sending SMS and Email Notification to Sender
                    sendSMS(tradeStatus.senderId.phoneNumber, smsText)
                    sendUserEmail(tradeStatus.senderId, mailText)

                    sendRealTimeNotification(io, userSocketId, { smsText, trade: true })
                }
            }

            sendRealTimeNotification(io, userSocketId, { text: `Hello user, \nReminder: 24 hours left to complete the trade`, trade: true });
            sendRealTimeNotification(io, receiverSocketId, { text: `Hello user, \nReminder: 24 hours left to complete the trade`, trade: true });

        }, 24 * 60 * 60 * 1000);

        // Expire the trade after 48 hours
        setTimeout(async () => {
            const countdown = await TradeCountdown.findOne({ tradeId });

            if (countdown && countdown.status48 === 'active') {
                const tradeStatus = await TradeStatus.findOne({ tradeId })
                .populate([
                    { path: 'senderId', select: 'name phoneNumber' },
                    { path: 'receiverId', select: 'name phoneNumber' }
                ]);

                if(tradeStatus.status === 'completed'){
                    return
                }

                // Send notifications
                sendSMS(tradeStatus.senderId.phoneNumber, `Hello ${tradeStatus.senderId.userName}, \nYour trade with id: ${tradeStatus.tradeId} and user: "${tradeStatus.receiverId.userName}" is expired and has been returned to the marketplace`)
                sendSMS(tradeStatus.receiverId.phoneNumber, `Hello ${tradeStatus.receiverId.userName}, \nYour trade with id: ${tradeStatus.tradeId} and user: "${tradeStatus.senderId.userName}" is expired and has been returned to the marketplace`)
                sendUserEmail(tradeStatus.senderId, `<p>Hello${tradeStatus.senderId.userName},</br>Your trade with id: ${tradeStatus.tradeId} and user: "${tradeStatus.receiverId.userName}" is expired and has been returned to the marketplace</p>`)
                sendUserEmail(tradeStatus.receiverId, `<p>Hello${tradeStatus.receiverId.userName},</br>Your trade with id: ${tradeStatus.tradeId} and user: "${tradeStatus.senderId.userName}" is expired and has been returned to the marketplace</p>`)

                // Trade expires if both users haven't completed
                await MatchedOfferStatus.findByIdAndDelete({ tradeId }); // Trade goes back to the marketplace
                await TradeStatus.findByIdAndDelete({ tradeId }); // Deleting Trade status document
                
                sendRealTimeNotification(io, userSocketId, { text, trade: true });
                sendRealTimeNotification(io, receiverSocketId, { text, trade: true });

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

// Sending Mail helper function
async function sendUserEmail(user, text){
    let content = {
        body: {
            name: `${user.userName}`,
            intro: `Here's your Currency Circle FX Trade notification`,
            outro: text
        }
    }
    
    let mail = await genMail(content)
    
    let mssg = {
        email: user.email,
        subject: "CCFX Trade Notification",
        message: mail
    }
    
    await sendMail(mssg)
}
