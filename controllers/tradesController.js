const Offer = require('../models/offersModel')
const { getOfferDetails } = require('./offersController')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')

const matchOffers = catchAsyncErrors(async(userOffer) => {
    try {
        const { from, to, user } = userOffer;

        // Find matching offers in the database
        const matchingOffers = await Offer.aggregate([
            {
                $match: {
                    $or: [
                        { $and: [{ from: to }, { to: from }] }, // Match reversed currencies
                        // { $and: [{ from: from }, { to: to }] }  // Match exact currencies
                    ],
                    user: { $ne: userOffer.user } // Exclude the user's own offer
                }
            }
        ]);

        return matchingOffers;
    } catch (error) {
        console.error('Error matching offers:', error);
        throw error;
    }
})

const getMatchedTrades = catchAsyncErrors(async (req, res, next) => {
    try{
        const offers = (await getOfferDetails(req)).offers

        const matchedOffersArray = [];

        // Loop through each offer and find matching offers
        for (let i = 0; i < offers.length; i++) {
            const userOffer = offers[i];

            // console.log('User offer',[i], userOffer)
       
            // Find matching offers for the current user offer
            const matchingOffers = await matchOffers(userOffer);

            // Push matched offers into the array
            matchedOffersArray.push({
                userOffer,
                matchingOffers
            })  
        }

        res.status(200).json({
            success: true,
            matchedOffers: matchedOffersArray,
            offers
        })  
    }catch (error) {
        res.json({
            success: false,
            // message: `Error matching offers for user offer ${userOffer._id}:`, error
        })
    }          
    
})


module.exports = {
    getMatchedTrades
}