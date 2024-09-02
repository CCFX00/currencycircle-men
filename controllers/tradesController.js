const Offer = require('../models/offersModel')
const { matchOffers, getOfferDetails } = require('../utils/offersHelper')
const { formatDate } = require('../utils/formatDate')

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



module.exports = {
    getMatchedTrades,
    displayMatchedTrades,
    displayAllMatchedTrades
}
