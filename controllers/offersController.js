const Offer = require('../models/offersModel')
const User = require('../models/userModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { getRate } = require('../utils/getRate')
const { formatDate } = require('../utils/formatDate')


// Get the rate
const displayRate = catchAsyncErrors(async(req, res, next) => {
    const { rate, rndRate } = await getRate(req)

    res.status(200).json({
        success: true,
        rate,
        rndRate
    })
})

// Create offer
const createOffer = catchAsyncErrors(async(req, res, next) => {
    try{
        let { amount, value, from, to, rate } = req.body

        // Convert offer amount to local string format
        amount = amount.toLocaleString().replace(/\u202f/g, ',')

        // Creating the offer
        const offer = await Offer.create({
            rate: parseFloat(rate).toFixed(2),
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
})

// Getting offer details
const getOfferDetails = async (req) => {
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
        rate: offer.rate,
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

// displayOfferDetails function
const displayOfferDetails = catchAsyncErrors(async (req, res, next) => {
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
})

module.exports = {
    displayRate,
    createOffer,
    getOfferDetails,
    displayOfferDetails
}
