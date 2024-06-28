const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    rate: {
        type: Number, 
        required: true
    },
    from: {
        type: String, 
        required: true
    },
    to: {
        type: String, 
        required: true
    },
    amount: {
        type: Number, 
        required: true
    },
    value: {
        type: String, 
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Offer', offerSchema)