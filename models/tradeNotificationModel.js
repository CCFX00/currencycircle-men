const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
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
    message: {
        type: String,
        required: true
    },
    tradeId: {
        type: mongoose.Schema.ObjectId,
        ref: "Matched Offer Status",
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '2d' // Automatically deletes after 2 days
    }
});

module.exports = mongoose.model('Trade Notification', notificationSchema);
