const mongoose = require('mongoose');
const validator = require('validator');

const emailValidator = function (value) {
  return value.includes('@') && value.includes('.');
};
const CountryCodeEnum = {
  values: ['+1', '+44', '+49', '+33', '+34', '+39', '+81'],
  message: 'Please select a valid country code'
};
const CountryEnum = {
  values: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Spain', 'Italy', 'Japan'],
  message: 'Please select a valid country'
};

const userSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please select title'],
    validate: {
      validator: function (value) {
        return ['Mr', 'Mrs', 'Ms', 'Miss'].includes(value);
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
    required: [true, 'Please enter a valid date in the format dd-mm-yyyy'],
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
    }
  },
  profession: {
    type: String,
    required: [true, 'Please enter your profession'],
    maxLength: [15, 'Enter ma']
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
    validate: {
      validator: function (value) {
        return validator.isMobilePhone(value, 'any');
      },
      message: 'Please enter a valid phone number'
    },
    CountryCode: {
      type: String,
      enum: CountryCodeEnum.values,
      required: [true, 'Please select a Country code']
    },
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password length must be at least 8 characters'],
    validate: {
      validator: function (value) {
        return /\W/.test(value); // Ensure it contains at least one special character
      },
      message: 'Password must contain at least one special character'
    },
    select: false
  },
  country: {
    type: String,
    required: [true, 'Please select a country code'],
    enum: CountryEnum
  },
  address1: {
    type: String,
    required: [true, 'Please enter address line 1'],
    maxLength: [20, 'alphanumeric maximum 20 characters'],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9]+$/.test(value);
      },
      message: 'Address line 1 should contain alphanumeric characters only'
    },
  },
  address2: {
    type: String,
    required: [true, 'Please enter address line 2'],
    maxLength: [20, 'alphanumeric maximum 20 characters'],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9]+$/.test(value);
      },
      message: 'Address line 2 should contain alphanumeric characters only'
    },
  },
  city: {
    type: String,
    required: [true, 'Please enter city'],
    maxLength: [20, 'City should not exceed 20 characters'],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9\s]+$/.test(value);
      },
      message: 'City should contain alphanumeric characters only'
    },
  },
  Code: {
    type: String,
    required: [true, 'Please enter your zip code'],
    maxLength: [10, 'alphanumeric maximum 10 characters'],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9]+$/.test(value);
      },
      message: 'Code should contain alphanumeric characters only'
    },
  },
  uploadPhoto: {
    type: String,
    required: [true, 'Please upload a photo'],
    validate: {
      validator: async function (value) {
        // Check if image is clear using Sharp
        const imageBuffer = Buffer.from(value, 'base64');
        try {
          const metadata = await sharp(imageBuffer).metadata();
          const isClear = metadata.channels === 3; // Assuming a clear image has 3 channels (RGB)
          return isClear;
        } catch (error) {
          console.error('Error processing image:', error);
          return false; // Return false if there's an error processing the image
        }
      },
      message: 'Please upload a clear image'
    },
  }

});

module.exports = mongoose.model('User', userSchema);