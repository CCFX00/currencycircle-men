const mongoose = require('mongoose')

const tradeStatusSchema = new mongoose.Schema({
    tradeId: {
        type: mongoose.Schema.ObjectId,
        ref: "Matched offer status",
        required: true
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    creationDate: {
        type: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Trade status', tradeStatusSchema)
