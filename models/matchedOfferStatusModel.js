const mongoose = require('mongoose')

const matchedOfferStatusSchema = new mongoose.Schema({
    loggedInUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    loggedInUserOfferId: {
        type: mongoose.Schema.ObjectId,
        ref: "Offer",
        required: true
    },
    matchedOfferOwnerId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },    
    matchedOfferId: {
        type: mongoose.Schema.ObjectId,
        ref: "Offer",
        required: true
    },
    isAccepted: {
        type: Boolean
    },
    creationDate: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Matched offer status', matchedOfferStatusSchema)
