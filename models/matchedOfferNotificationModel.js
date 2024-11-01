const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    matchFee: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isAccepted: {
        type: Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Matched Offer Notification', notificationSchema)
