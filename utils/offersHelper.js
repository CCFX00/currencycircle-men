const Offer = require('../models/offersModel')
const { formatDate } = require('./dateTime')
const { checkOfferStatus } = require('./checkOfferStatus')

// Getting offer details
exports.getOfferDetails = async (req) => {
    const offer = await Offer.find({ user: (req.user._id).toString() }).populate(
        'user',
        'name city country userName'
    )

    if (offer.length === 0) {
        return {
            success: false,
            message: 'You have no offers',
        }
    }

    // Extract user information from the first offer
    const user = offer[0].user || {};

    // Remove user field from each offer object
    const offers = offer.map(offer => ({
        _id: offer._id,
        rate: (offer.rate).toFixed(5),
        from: offer.from,
        to: offer.to,
        amount: offer.amount,
        value: offer.value,
        user: user._id,
        createdAt: formatDate({ createdAt: offer.createdAt })
    }))

    return {
        user,
        offers
    }
}

// Matching the offers
exports.matchOffers = async (userOffer, allOffers) => {
    const { from: userOfferFrom, to: userOfferTo, user: userId, value: value, _id: userOfferId } = userOffer
    const userOfferValue = parseFloat(value.replace(/,/g, ''))

    // Filter matching offers from all offers
    const matchingOffers = await Promise.all(
        allOffers.filter(offer => {
            if (offer.user.toString() !== userId.toString()) {
                const offerAmount = parseFloat(offer.amount.replace(/,/g, ''))
                const percentageOff = userOfferValue * 0.1
                const upperBound = userOfferValue + percentageOff
                const lowerBound = userOfferValue - percentageOff

                // Ensure the offer value is within ±10% range of the user offer value
                return (
                    offerAmount >= lowerBound &&
                    offerAmount <= upperBound &&
                    offer.from === userOfferTo &&
                    offer.to === userOfferFrom
                )
            }
            return false
        }).map(async offer => {
            return await checkOfferStatus(offer, userId, userOfferId)
        })
    )

    // Filter out null values (non-matching offers)
    return matchingOffers.filter(offer => offer !== null)
}
