const mongoose = require('mongoose');
const validator = require('validator');

const emailValidator = function (value) {return value.includes('@') && value.includes('.');};
const passwordValidator = function (value) { const alphanumericRegex = /^[a-zA-Z0-9]+$/; if (!alphanumericRegex.test(value)){return false;}};

const userSchema = new mongoose.Schema({
    title: {
      type: String,
      required: [true, 'Please select title'],
      validate: {
        validator:function(value){
            return ['Mr', 'Mrs', 'Dr'].includes(value);
        },
        message: 'Invalid Title. Must be one of: Mr, Mrs, Ms, Miss'
      }
    },
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      minLength: [3, 'Sorry, the name field cannot be less than 3 characters'],
      maxLength: [30, 'Sorry, the name field cannot exceed 30 characters']
    },
    dob: {
      type: Date,
      required: [true, 'Please enter a valid date in the format yyyy-mm-dd'],
    },
    userName: {
      type: String,
      required: [true, 'Please enter a username'],
      unique: [true, 'Sorry, this username is already registered. Please use a different one'],
      maxLength: [12, 'Username should contain a maximum of 12 characters'],
      validate: {
        validator: function (value) {
            return !/\s/.test(value);
        },
        message: 'Username should not contain any spaces'
      },
    },
    profession: {
      type: String,
      required: [true, 'Please enter your profession']
    },
    email: {
      type: String,
      required: [true, 'Please enter an email address'],
      validate: [validator.isEmail, 'Please enter a valid email address'],
      unique: [true, 'Sorry, this email is already registered'],
      lowercase: true
    },
    phoneNumber: {
      type: String,
      validate: [validator.isMobilePhone, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      required: [passwordValidator, 'Password should be alphanumeric, 8 characters, and contain atleast 1 special character'],
      required: [true, 'Please enter your password'],
      minLength: [8, 'Password length must be at least 8 characters'],
      select: false
    },
    country: {
      type: String,
      required: [true, 'Please enter a country']
    },

    
    resetPasswordDate: String,
    resetPasswordTime: Date
  });


// hashing password


// generate JWT token


module.exports = mongoose.model('User', userSchema)