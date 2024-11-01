const Offer = require('../models/offersModel')
const MatchedOfferStatus = require('../models/matchedOfferStatusModel')
const { getOfferDetails } = require('../utils/offersHelper')
const { startTradeCountdown } = require('../utils/timer')

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
const acceptOffer = async (userId, userOfferId, matchedOfferId, matchedOfferOwnerId, io, receiverSocketId) => {
    try {
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
                
        // Starting the countdown function
        startTradeCountdown({ io, tradeId: upsertedId, receiverSocketId })

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
