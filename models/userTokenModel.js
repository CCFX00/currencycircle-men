const mongoose = require('mongoose');

const userTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    // expiresAt: {
    //     type: Date,
    //     default: () => Date.now() + parseInt(process.env._JWT_REFRESH_TOKEN_MODEL_EXPIRATION, 10)
    // },
});

module.exports = mongoose.model('UserToken', userTokenSchema);
