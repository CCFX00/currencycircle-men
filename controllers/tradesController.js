const Offer = require('../models/offersModel')
const { matchOffers, getOfferDetails } = require('../utils/offersHelper')
const { formatDate } = require('../utils/dateTime')
const TradeStatus = require('../models/tradeStatusModel')
const MatchOfferStatus = require('../models/matchedOfferStatusModel')
const TradeNotification = require('../models/tradeNotificationModel')


const getMatchedTrades = async (req, res) => {
    try {
        const userOffers = (await getOfferDetails(req)).offers
        const allOffers = await Offer.find()

        if (!userOffers) {
            return res.json({
                success: false,
                message: 'You have no offers',
            })
        }

        const matchedOffersArray = await Promise.all(userOffers.map(async userOffer => {
            const matchedOffers = await matchOffers(userOffer, allOffers)

            // Update matching offers count property
            userOffer.matchCount = matchedOffers.length.toString() || 0

            return {
                userOffer,
                matchedOffers
            }
        })) 

        // Return matched offers if res is not provided
        if (!res) {
            return matchedOffersArray
        }

        // Send response if res is provided
        res.status(200).json({
            success: true,
            userOffers,
            matchedOffersArray
        })
    } catch (error) {
        if (!res) {
            throw new Error(`Error matching offers: ${error.message}`)
        }
        res.status(500).json({
            success: false,
            message: `Error matching offers: ${error.message}`
        })
    }
}

const displayMatchedTrades = async (req, res) => {
    try {
        const { userOfferId } = req.body
        const matchedOffersArray = await getMatchedTrades(req, null)

        // Find the user's matching offers with the specified offerId
        const result = (matchedOffersArray.find(offer => offer.userOffer._id.toString() === userOfferId.toString()))
        const matchedOffers = result.matchedOffers
        const userOffer = result.userOffer

        let matches = []

        await Promise.all(matchedOffers.map(async matchedOffer => {
            await matchedOffer.populate(
                'user',
                'name city country userName userImage'
            )            
            matchedOffer.creationDate = formatDate(matchedOffer)
            matches.push(matchedOffer)
        }))

        if(matches.length > 0) {
            return res.status(200).json({
                success: true,
                matches,
                userOffer
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Sorry, no matches were found for this offer ID'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error getting match trades: ${error.message}`
        })
    }
}

const displayAllMatchedTrades = async (req, res) => {
    try {
        const matchedOffersArray = await getMatchedTrades(req, null)
        
        let allMatchedOffers = []

        for (const userOffer of matchedOffersArray) {
            if (userOffer.matchedOffers.length > 0) {
                await Promise.all(userOffer.matchedOffers.map(async matchedOffer => {
                    // Populate each matched offer with it's user details
                    await matchedOffer.populate(
                        'user',
                        'name city country userName userImage'
                    )

                    // Format the creation date
                    matchedOffer.creationDate = formatDate(matchedOffer)
                }))

                // Concatenate the matched offers with the overall list
                allMatchedOffers = allMatchedOffers.concat(userOffer.matchedOffers)
            }            
        }

        if (allMatchedOffers.length > 0) {
            res.status(200).json({
                success: true,
                allMatchedOffers
            })
        } else {  
            res.status(200).json({
                success: false,
                message: 'User has no matched offers'
            })           
        }     
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Error getting matched trades: ${err.message}`
        })
    }
}

// Mark trade as completed
const completeTrade = async ({ tradeId, senderId, receiverId, offerId }) => {
    try {
        const tradeStatus = await TradeStatus.findOne({ tradeId });

        if (!tradeStatus) {
            return { 
                success: false, 
                message: 'Trade not found' 
            }
        }

        if (tradeStatus.senderId === null) { 
            tradeStatus.senderId = senderId // Filling the senderId field
            tradeStatus.receiverId = receiverId  // Filling the receiverId field
            if(tradeStatus.offerId === null) {
                tradeStatus.offerId = offerId
            }
        } 

        // if (tradeStatus.senderId !== null && tradeStatus.senderId.toString() !== senderId) {
        //     tradeStatus.receiverId = senderId // Filling the receiverId field on the second request (Receiver)
        // }

        // Update completion status based on sender or receiver role
        if (tradeStatus.senderId.toString() === senderId) {
            tradeStatus.senderCompleted = true;  // Filling the senderId completed field for the first request (Sender)
            tradeStatus.status = 'pendingPartial';
        } else if (tradeStatus.receiverId.toString() === senderId) {
            tradeStatus.receiverCompleted = true;  // Filling the receiverId completed field on the second request (Receiver)
            tradeStatus.status = 'pendingPartial';
        }

        // Check if both parties have marked the tradeStatus as complete
        if (tradeStatus.senderCompleted && tradeStatus.receiverCompleted) {
            tradeStatus.status = 'completed';
        }

        tradeStatus.updatedAt = Date.now();
        await tradeStatus.save();

        return {
            success: true,
            message: tradeStatus.status === 'completed' ? 'Trade marked as completed' : 'Awaiting confirmation from the counterparty',
            tradeStatus,
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Error completing trade: ${error.message}` 
        }
    }
}

// Cancel a trade
const cancelTrade = async ({ tradeId, senderId, receiverId, offerId }) => {
    try {
        const trade = await TradeStatus.findOne({ tradeId });

        if (!trade) {
            return { 
                success: false, 
                message: 'Trade not found'
            };
        }

        // Mark trade as cancelled immediately when any party initiates cancellation
        trade.senderId = senderId;
        trade.receiverId = receiverId;
        trade.offerId = offerId;
        trade.status = 'cancelled';
        trade.cancelledBy = senderId,
        trade.updatedAt = Date.now();
        await trade.save();

        await MatchOfferStatus.deleteOne({ _id: tradeId })

        return {
            success: true,
            message: 'Trade has been cancelled',
            trade,
        }
    } catch (error) {
        return { 
            success: false, 
            message: `Error cancelling trade: ${error.message}` 
        }
    }
}

// Get all completed trades
const getAllCompletedTrades = async (req, res) => {
    try {
        const { userId } = req.body

        const completedTrades = await TradeStatus.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
            status: "completed"
        })
        .populate([
            { path: 'senderId', select: 'name userName city country userImage' },
            { path: 'receiverId', select: 'name userName city country userImage' },
            { path: 'offerId', select: 'from to amount value rate' }
        ]) // Populates sender details, receiver details, the offer details

        if (completedTrades.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No completed trades found',
                completedTrades: []
            });
        }

        return res.status(200).json({
            success: true,
            completedTrades
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching completed trades: ${error.message}`
        });
    }
};

// Get all cancelled trades
const getAllCancelledTrades = async (req, res) => {
    try {
        const { userId } = req.body

        const cancelledTrades = await  TradeStatus.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
            status: "cancelled"
        })
        .populate([
            { path: 'senderId', select: 'name userName city country userImage' },
            { path: 'receiverId', select: 'name userName city country userImage' },
            { path: 'offerId', select: 'from to amount value rate' }
        ]) // Populates sender details, receiver details, the offer details

        if (cancelledTrades.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No cancelled trades found',
                cancelledTrades: []
            })
        }

        return res.status(200).json({
            success: true,
            cancelledTrades
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error fetching cancelled trades: ${error.message}`
        })
    }
};


module.exports = {
    getMatchedTrades,
    displayMatchedTrades,
    displayAllMatchedTrades,
    completeTrade,
    cancelTrade,
    getAllCompletedTrades,
    getAllCancelledTrades
}
