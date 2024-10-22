const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    roomId: { 
        type: String, 
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
    recieverId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    recieverName: {
        type: String, 
        required: true 
    },
    recieverImage: {
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
