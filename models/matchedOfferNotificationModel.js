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
    trade: {   // added trade and tradeId to be able to store notification after it has been accepted, this will help differentiate between the received one. 
        type: Boolean
    }, 
    tradeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matched Offer Status',
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
