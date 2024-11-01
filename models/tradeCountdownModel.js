const mongoose = require('mongoose');

const tradeCountdownSchema = new mongoose.Schema({
    tradeId: {
        type: mongoose.Schema.ObjectId,
        ref: "Matched Offer Status",
        required: true
    },
    status24: {
        type: String,
        enum: ["active", "expired"], 
        default: "active"
    },
    status48: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
    }
});

module.exports = mongoose.model('Trade Countdown', tradeCountdownSchema);