const mongoose = require('mongoose')

const matchedOfferStatusSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    matchedOfferId: {
        type: mongoose.Schema.ObjectId,
        ref: "Offer",
        required: true
    },
    matchedUserId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    isAccepted: {
        type: Boolean
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Matched offer status', matchedOfferStatusSchema)
