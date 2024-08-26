const matchedOfferStatus = require('../models/matchedOfferStatusModel')

exports.checkOfferStatus = async (offer, userId, userOfferId) => {
    // Fetch status for the logged-in user or the offer owner
    const offerOrLoggedInUserStatus = await matchedOfferStatus.findOne({
        $or: [
            {
                loggedInUserId: userId,
                loggedInUserOfferId: userOfferId,
                matchedOfferOwnerId: offer.user,
                matchedOfferId: offer._id
            },
            {
                loggedInUserId: offer.user,
                loggedInUserOfferId: offer._id,
                matchedOfferOwnerId: userId,
                matchedOfferId: userOfferId
            }
        ]
    })

    // Handle visibility based on the acceptance or decline status
    if (offerOrLoggedInUserStatus) {
        if (offerOrLoggedInUserStatus.isAccepted === false) {
            return null // Hide the offer from the logged-in user and offer owner if declined
        }

        if (offerOrLoggedInUserStatus.isAccepted === true) {
            return offer // Show the offer only to the logged-in user and offer owner if accepted
        }
    } else {
        // Check if the offer has been accepted or declined by other users
        const existingOfferStatus = await matchedOfferStatus.findOne({
            $or: [
                {
                    loggedInUserId: offer.user,
                    loggedInUserOfferId: offer._id
                },
                {
                    matchedOfferOwnerId: offer.user,
                    matchedOfferId: offer._id
                }
            ]
        })

        // Handle cases based on the existing status
        if (existingOfferStatus) {
            if (existingOfferStatus.isAccepted === true) {
                return null // Hide the offer if it has been accepted by other users
            }
            if (existingOfferStatus.isAccepted === false) {
                return offer // if the offer has been declined show the offer except to those involved in the declension
            }
        } else {
            // If no status is found, it means the offer hasn't been accepted or declined
            return offer // Show the offer to everyone
        }
    }

    return null // Default to hiding the offer otherwise
}
