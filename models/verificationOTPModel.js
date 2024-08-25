const mongoose = require('mongoose')
const validator = require('validator');

const verificationOTPSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: [true, 'Please enter an email address'],
        validate: [validator.isEmail, 'Please enter a valid email address'],
        lowercase: true
    },
    otp: {
        type: String,
        required: [true, 'Please enter the verification one time password sent to you email']
    },
    createdAt: Date,
    expiresAt: Date 
}) 

module.exports = mongoose.model('Verification OTP', verificationOTPSchema)