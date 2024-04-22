const mongoose = require('mongoose')

const userImgSchema = new mongoose.Schema({
   uid: {
    type: String,
    required: [true, 'Please provide user ID.']
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

module.exports = mongoose.model('UserImage', userImgSchema)
 