const Offer = require('../models/offersModel')
const User = require('../models/userModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { getRate } = require('../utils/getRate')


// Get the rate
exports.getRate = catchAsyncErrors(async(req, res, next) => {
    const rate = (await getRate(req)).rate

    res.status(200).json({
        success: true,
        rate
    })
})

// Create offer
exports.createOffer = catchAsyncErrors(async(req, res, next) => {
    const { amount, userRate, from, to } = req.body

    // Get the rate based on the presence of userRate
    const rate = userRate ? userRate : (await getRate(req)).rate;

    // Calculate the offer value
    const value = (rate * amount).toLocaleString().replace(/\u202f/g, ',');

    // Create the offer
    const offer = await Offer.create({
        rate: rate,
        from: from,
        to: to,
        amount: amount,
        value: value,
        user: req.user._id,
        createdAt: Date.now()
    });

    // Send the response
    res.status(200).json({
        success: true,
        message: "Your Offer has been created successfully",
        offer
    });
});

// Getting offer details
exports.getOfferDetails = catchAsyncErrors(async(req, res, next) => {

    const offer = await Offer.find({ user: (req.user._id).toString() }).populate(
        'user',
        'name email country userName'
    )

    if(offer.length === 0) {
        const usr = await User.findById((req.user._id).toString())
        return res.status(404).json({
            success: true,
            message: 'You have no offers, Matched trades or discussions',
            usr
        })
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
        createdAt: offer.createdAt
    }));

    res.status(200).json({
        success: true,
        user: user,
        offers: offers
    })
})
