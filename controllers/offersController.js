const Offer = require('../models/offersModel')
const MatchedOfferStatus = require('../models/matchedOfferStatusModel')
const { getOfferDetails } = require('../utils/offersHelper')
const { startTradeCountdown } = require('./timerController')
const TradeStatus = require('../models/tradeStatusModel');
const MatchOfferNotification = require('../models/matchedOfferNotificationModel')

// Create offer
const createOffer = async(req, res) => {
    try{
        let { amount, value, from, to, rate } = req.body

        // Convert offer amount to local string format
        amount = amount.toLocaleString().replace(/\u202f/g, ',')

        // Creating the offer
        const offer = await Offer.create({
            rate: parseFloat(rate),
            from: from,
            to: to,
            amount: amount,
            value: value,
            user: req.user._id,
            createdAt: Date.now()
        })

        res.status(200).json({
            success: true,
            message: "Your Offer has been created successfully",
            offer
    })
    }catch(err){
        res.status(500).json({
            success: false,
            message: err.message
        })
    }
}

// Display Offer Details
const displayOfferDetails = async (req, res) => {
    const offerDetails = await getOfferDetails(req)

    if (offerDetails.success === false) {
        return res.status(200).json({
            success: false,
            message: 'You have no offers',
        })
    }

    res.status(200).json({
        success: true,
        user: offerDetails.user,
        offers: offerDetails.offers
    })
}

// Accepting an offer
const acceptOffer = async (userId, userOfferId, matchedOfferId, matchedOfferOwnerId, matchFee, name, io, receiverSocketId, userSocketId) => {
    try {

        // console.log(userId, matchedOfferId, matchedOfferOwnerId)
        
        // Delete all documents where `receiverId` does not match `userId` (Match offer request sent from one user to many other users)
        await MatchOfferNotification.deleteMany({
            senderId: matchedOfferOwnerId,
            offerId: matchedOfferId,
            recieverId: { $ne: userId }
        });

        // Delete all documents where `senderId` does not match `matchedOfferOwnerId` and `offerId` does not match `matchedOfferId` (Match offer requests received from more than one other user)
        // await MatchOfferNotification.deleteMany({
        //     $or: [
        //         { senderId: { $ne: matchedOfferOwnerId } },
        //         { offerId: { $ne: matchedOfferId } }
        //     ]
        // });  // Both work individually but the issue is to find how to make them work in one query


        // Update the matched offer status for both users
        const { upsertedId } = await MatchedOfferStatus.updateMany(
            { 
                $or: [
                    { 
                        loggedInUserId: userId, 
                        loggedInUserOfferId: userOfferId, 
                        matchedOfferOwnerId: matchedOfferOwnerId, 
                        matchedOfferId: matchedOfferId 
                    },
                    { 
                        loggedInUserId: matchedOfferOwnerId, 
                        loggedInUserOfferId: matchedOfferId, 
                        matchedOfferOwnerId: userId, 
                        matchedOfferId: userOfferId 
                    }
                ]
            },{ 
                $set: { 
                    loggedInUserId: userId, 
                    loggedInUserOfferId: userOfferId, 
                    matchedOfferOwnerId: matchedOfferOwnerId, 
                    matchedOfferId: matchedOfferId,
                    isAccepted: true
                } 
            },
            { upsert: true, new: true }
        )

        // Storing the the Trade Status
        const tradeStatus = await TradeStatus.create({
            tradeId: upsertedId
        }).then().catch(err => {throw new Error(err)})

        // Sending the notification to the counterpay ( ...ensuring that the notification is stored in the database)
        const message = {text: `Reminder: Your offer has been accepted, you have 48 hours left to complete the trade`, trade: true}
        // const message = {text: `Reminder: ${name} has accepted your offer, you have 48 hours left to complete the trade`, trade: true}
        if(receiverSocketId) io.to(receiverSocketId).emit('newNotification', { message })
        
        // Storing the Trade Notification for offer acceptance
        // await MatchOfferNotification.create({
        //     tradeId: upsertedId,
        //     trade: true,
        //     offerId: userOfferId,
        //     matchFee,
        //     senderId: userId,
        //     recieverId: matchedOfferOwnerId,
        //     message: `Reminder: ${name} has accepted your offer, you have 48 hours left to complete the trade`            
        // })  //faced an issue with the sender name not corresponding instead to the receiver, has to be addressed from the front end and correct data gotten from the cookies. Had to comment this out since it was creating some mixup on the froontend.
                
        // Starting the countdown function
        startTradeCountdown({ io, tradeId: upsertedId, receiverSocketId, userSocketId })

        return {
            success: true,
            message: 'Offer accepted'
        }
    } catch (error) {
        return {
            success: false,
            message: `Error accepting offer: ${error.message}`
        }
    }
}


// Declining an offer
const declineOffer = async (userId, userOfferId, matchedOfferId, matchedOfferOwnerId, io, receiverSocketId) => {
    try {
        // Update the matched offer status for both users
        await MatchedOfferStatus.updateMany(
            { 
                $or: [
                    { 
                        loggedInUserId: userId, 
                        loggedInUserOfferId: userOfferId, 
                        matchedOfferOwnerId: matchedOfferOwnerId, 
                        matchedOfferId: matchedOfferId 
                    },
                    { 
                        loggedInUserId: matchedOfferOwnerId, 
                        loggedInUserOfferId: matchedOfferId, 
                        matchedOfferOwnerId: userId, 
                        matchedOfferId: userOfferId 
                    }
                ]
            },{ 
                $set: { 
                    loggedInUserId: userId, 
                    loggedInUserOfferId: userOfferId, 
                    matchedOfferOwnerId: matchedOfferOwnerId, 
                    matchedOfferId: matchedOfferId,
                    isAccepted: false
                } 
            },
            { upsert: true, new: true }
        )

        return {
            success: true,
            message: 'Offer declined'
        }
    } catch (error) {
        return {
            success: false,
            message: `Error declining offer: ${error.message}`
        }
    }
}

module.exports = {
    createOffer,
    displayOfferDetails,
    acceptOffer,
    declineOffer
}
