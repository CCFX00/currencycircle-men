const ChatModel = require('../models/chatModel');
const { encryptValue, decryptValue } = require('../utils/hashingLogic');

// Retrieve chat history for a specific room (decrypt before sending)
exports.getChatHistory = async (roomId) => {
    try {
        const messages = await ChatModel.find({ roomId }).sort({ createdAt: 1 });

        // Decrypt messages before sending to the client
        const decryptedMessages = await Promise.all(messages.map(async (msg) => {
            // Decrypt the message
            const decryptedMessage = await decryptValue(msg.message, msg.message);

            // Spread the existing document's properties and replace encrypted message with decrypted
            return { ...msg._doc, message: decryptedMessage };
        }));

        return decryptedMessages;
    } catch (err) {
        console.error('Error fetching chat history:', err);
        return [];
    }
};

// Save a new message to the chat (encrypt the message)
exports.saveMessage = async (roomId, userId, message) => {
    try {
        // Encrypt the message before saving
        const encryptedMessage = await encryptValue(message);

        const newMessage = new ChatModel({
            roomId,
            userId,
            message: encryptedMessage, // Save the encrypted message
            createdAt: Date.now(),
            expiresAt: Date.now() + (2 * 365 * 24 * 60 * 60 * 1000) // Message expires in 2 years
        });

        const savedMessage = await newMessage.save();
        return savedMessage;
    } catch (err) {
        console.error('Error saving message:', err);
        return null;
    }
};
