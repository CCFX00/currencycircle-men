const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.ObjectId,
        ref: "Matched Offer Status",
        required: true
    },
    senderId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    senderName: {
        type: String, 
        required: true 
    },
    senderImage: {
        type: String
    },
    receiverId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    receiverName: {
        type: String, 
        required: true 
    },
    receiverImage: {
        type: String
    },
    message: { 
        type: String, 
        required: true 
    },    
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    expiresAt: { 
        type: Date 
    }
})

module.exports = mongoose.model('Message', messageSchema)
