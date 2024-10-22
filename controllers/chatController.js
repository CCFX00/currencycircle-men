const Message = require('../models/messageModel')
const { encryptMessage, decryptMessage } = require('../utils/hashingLogic')
const { checkProfanity } = require('../utils/profanityFilter')
const { genDateTime } = require('../utils/dateTime')

// Save a new message to the chat (encrypt the message)
exports.saveMessage = async ({ roomId, userId, message, senderName, senderImage, recieverId, recieverName, recieverImage }) => {
    try {
        // Check for profanity in message
        const foundProfanityList = await checkProfanity(message) 

        if(foundProfanityList.length > 0) {
            return {
                success: false,
                message: `Message couldn't be sent because it contains the following profanities: ${foundProfanityList.join(', ')}`
            }
        }

        // Encrypt the message before saving
        const encryptedMessage = await encryptMessage(message)

        // Generate current date and time
        const { date, time } = genDateTime()

        const newMessage = new Message({
            roomId,
            message: `${encryptedMessage.iv}:${encryptedMessage.encryptedData}`, // Combine IV and encryptedData, 
            senderId: userId,
            senderName,
            senderImage,
            recieverId,
            recieverName,
            recieverImage,
            date,
            time,
            createdAt: Date.now(),
            expiresAt: Date.now() + (2 * 365 * 24 * 60 * 60 * 1000) // Message expires in 2 years
        })

        let savedMessage = await newMessage.save()

        // Sending original unencrypted message in the response
        savedMessage = { ...savedMessage.toObject(), message }

        return {
            success: true,
            savedMessage
        }
    } catch (err) {
        console.error('Error saving message:', err)
        return null
    }
}


// Retrieve chat history for a specific room (decrypt before sending)
exports.getChatHistory = async (roomId) => {
    try {
        const messages = await Message.find({ roomId }).sort({ createdAt: 1 })

        // Decrypt messages before sending to the client
        const decryptedMessages = await Promise.all(messages.map(async (msg) => {
            const [iv, encryptedData] = msg.message.split(':') // Split iv and encrypted data
            const decryptedMessage = await decryptMessage(encryptedData, iv) // Decrypt with iv and encryptedData
            return { ...msg._doc, message: decryptedMessage }
        }))

        return decryptedMessages
    } catch (err) {
        console.error('Error fetching chat history:', err)
        return []
    }
}
