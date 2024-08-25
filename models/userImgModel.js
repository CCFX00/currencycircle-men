const mongoose = require('mongoose')
const validator = require('validator')

const userImgSchema = new mongoose.Schema({
   email: {
      type: String,
      required: [true, 'Please enter an email address'],
      validate: [validator.isEmail, 'Please enter a valid email address'],
      lowercase: true
   },
   imagePath: {
    type: String,
    required: [true, 'Please provide image path']
   },
   imageId: {
    type: String,
    required: [true, 'Please provide image ID']
   },
   savedName: {
    type: String,
    required: [true, 'Please provide name save in Google drive']
   }
}, {timestamps: true})

module.exports = mongoose.model('User image', userImgSchema)
 