const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    userId: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }
});

// Set MongoDB TTL index for automatic message deletion after 2 years
chatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Chat', chatSchema);
