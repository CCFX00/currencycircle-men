const Offer = require('../models/offersModel')
const { getOfferDetails } = require('./offersController')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { formatDate } = require('../utils/formatDate')

const matchOffers = async (userOffer, allOffers) => {
    const { from: userFrom, to: userTo, user: userId, value } = userOffer
    const userOfferValue = parseFloat(value.replace(/,/g, ''))

    // Filter matching offers from all offers
    const matchingOffers = allOffers.filter(offer => {
        if (offer.user.toString() !== userId.toString()) {
            const offerValue = parseFloat(offer.value.replace(/,/g, ''))
            const percentageOff = userOfferValue * 0.1
            const upperBound = userOfferValue + percentageOff
            const lowerBound = userOfferValue - percentageOff
            
            // console.log('\n User Offer Value:', userOfferValue)
            // console.log('Offer Value:', offerValue)
            // console.log('Percentage Range: ( lower bound:', lowerBound, '- upper bound:', upperBound, ')')
            // console.log(offer, '\n')

            // Ensure the offer value is within ±10% range of the user offer value
            if (offerValue >= lowerBound && offerValue <= upperBound) {
                return (
                    offer.from === userTo &&
                    offer.to === userFrom
                )
            }
        }
        return false
    })
    return matchingOffers
}

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
            const matchingOffers = await matchOffers(userOffer, allOffers)

            // Update matching offers count property
            userOffer.matchCount = matchingOffers.length.toString() || 0

            return {
                userOffer,
                matchingOffers
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
        const matchedOffers = await getMatchedTrades(req, null)

        // Find the user's matching offers with the specified offerId
        const matchingOffers = (matchedOffers.find(offer => offer.userOffer._id.toString() === userOfferId.toString())).matchingOffers

        let matches = []

        const matchedTradesArray = await Promise.all(matchingOffers.map(async matchedOffer => {
            await matchedOffer.populate(
                'user',
                'name city country userName userImage'
            )            
            matchedOffer.creationDate = formatDate(matchedOffer)
            matches.push(matchedOffer)
        }))

        if(matchedTradesArray.length > 0) {
            return res.status(200).json({
                success: true,
                matches
            })
        }
        return res.status(200).json({
            success: true,
            message: 'Sorry no matches were found for this offer ID'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error getting match trades: ${error.message}`
        })
    }
}

module.exports = {
    getMatchedTrades,
    displayMatchedTrades
}
