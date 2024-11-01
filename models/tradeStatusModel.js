const mongoose = require('mongoose');

const tradeStatusSchema = new mongoose.Schema({
    tradeId: {
        type: mongoose.Schema.ObjectId,
        ref: "Matched Offer Status",
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
    senderCompleted: {
        type: Boolean,
        default: false,
    },
    receiverCompleted: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ["pending", "pendingPartial", "completed", "cancelled"],  // adjustments => if (pending || pendingPartial && duration == 24hrs) { cancel and take back to the marketplace}, 72hrs for the trade to be completed once matched. 
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trade Status', tradeStatusSchema);
