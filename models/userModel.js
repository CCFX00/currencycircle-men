const mongoose = require('mongoose')
const validator = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        minLength: [3, 'Sorry Name field cannot be less than 3 characters'],
        maxlength: [30, 'Sorry Name field cannot exceed 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Please enter an email address'],
        validate: [validator.isEmail, 'Please enter a valid email address'],
        unique: [true, 'Sorry this email is already been registered'],
        lowercase: true
    },
    userName: {
        type: String, 
        required: [true, 'Please enter a username'],
        unique: [true, 'Sorry this Username is already registered, try using a different one'],
    },
    country:{
        type: String, 
        required: [true, 'Please enter a country']
    },
    phoneNumber:{
        type: String, 
        validate: [validator.isMobilePhone, 'Please enter a valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, 'Password length must be at least 8 characters'], 
        select: false
    },
    dob: {
        type: Date,
        required: [true, 'Please enter a valid date in the format yyyy-mm-dd']
    },
    role: {
        type: String,
        default: 'user'
    },
    resetPasswordDate: String,
    resetPasswordTime: Date
})

// hashing password



// generate JWT token


module.exports = mongoose.model('User', userSchema)