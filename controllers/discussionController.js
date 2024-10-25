const MatchedOfferStatus = require('../models/matchedOfferStatusModel')
const { formatDate } = require('../utils/dateTime')

exports.getInDiscussionTrade = async(req, res) => {
    try{
        const { matchedOfferId, matchedOfferOwnerId, userId, userOfferId } = req.body
        const inDiscussionTrade = await MatchedOfferStatus.findOne(
            {
                $or: [
                    {
                        loggedInUserId: userId,
                        loggedInUserOfferId: userOfferId,
                        matchedOfferId: matchedOfferId,
                        matchedOfferOwnerId: matchedOfferOwnerId,
                    },
                    {
                        loggedInUserId: matchedOfferId,
                        loggedInUserOfferId: matchedOfferOwnerId,
                        matchedOfferId: userId,
                        matchedOfferOwnerId: userOfferId,
                    }
                ],
                $and: [
                    { isAccepted: true }
                ]            
            }
        ).populate([
            { path: 'loggedInUserId', select: 'name userName city userImage' },  // Populate `loggedInUserId`
            { path: 'matchedOfferId', select: 'rate from to amount value' },  // Populate `matchedOfferId`
            { path: 'matchedOfferOwnerId', select: 'name userName city userImage' }  // Populate `matchedOfferOwnerId`
        ])

        if (!inDiscussionTrade) {
            return res.status(404).json({
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            inDiscussionTrade
        })
    }catch(err){
        res.status(404).json({
            success: false,
            message: `Error getting in discussion trade with error : ${err}`
        })
    }
}


exports.getAllInDiscussionTrades = async(req, res) => {
    try{
        const userId = req.user._id
        const inDiscussionTrades = await MatchedOfferStatus.find({
            $or: [
                {loggedInUserId: userId},
                {matchedOfferOwnerId: userId}
            ],
            $and: [
                { isAccepted: true }
            ]
        })
        .populate([
            { path: 'loggedInUserId', select: 'name userName city userImage currency' },  // Populate `loggedInUserId`
            { path: 'matchedOfferId', select: 'rate from to amount value' },  // Populate `matchedOfferId`
            { path: 'matchedOfferOwnerId', select: 'name userName city userImage currency' }  // Populate `matchedOfferOwnerId`
        ])

        if (!inDiscussionTrades) {
            return res.status(404).json({
                success: false
            })
        }

        // Update `updatedAt` field by formatting the date
        inDiscussionTrades.map(discussion => {
            // If the currently logged-in user is in the `matchedOfferOwnerId`, swap the roles
            if (String(discussion.matchedOfferOwnerId._id) === String(userId)) {
                // Swap loggedInUserId and matchedOfferOwnerId
                [discussion.loggedInUserId, discussion.matchedOfferOwnerId] = [discussion.matchedOfferOwnerId, discussion.loggedInUserId];
            }
            discussion.creationDate = formatDate(discussion)
            return discussion
        })

        return res.status(200).json({
            success: true,
            inDiscussionTrades
        })
    }catch(err){
        res.status(404).json({
            success: false,
            message: `Error getting in discussion trade with error : ${err}`
        })
    }
}