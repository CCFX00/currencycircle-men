const mongoose = require('mongoose');
const validator = require('validator');

const countryCodeEnum = {
  values: ['+237', '+44', '+1', '+971', '+33', '+86', '+20', '+234', '+1', '+49', '+91', '+81', '+61', '+7', '+82', '+39', '+34', '+55', '+27', '+52'],
  message: 'Please select a valid country code'
};

const countryEnum = {
  values: [
    'Cameroon',          // <!-- +237 -->
    'United Kingdom',    // <!-- +44 -->
    'United States',     // <!-- +1 -->
    'United Arab Emirates', // <!-- +971 -->
    'France',            // <!-- +33 -->
    'China',             // <!-- +86 -->
    'Egypt',             // <!-- +20 -->
    'Nigeria',           // <!-- +234 -->
    'Canada',            // <!-- +1 -->
    'Germany',           // <!-- +49 -->
    'India',             // <!-- +91 -->
    'Japan',             // <!-- +81 -->
    'Australia',         // <!-- +61 -->
    'Russia',            // <!-- +7 -->
    'South Korea',       // <!-- +82 -->
    'Italy',             // <!-- +39 -->
    'Spain',             // <!-- +34 -->
    'Brazil',            // <!-- +55 -->
    'South Africa',      // <!-- +27 -->
    'Mexico'             // <!-- +52 -->
  ],
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
    },
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
      validator: (value) => !/\s/.test(value),
      message: 'Username should not contain any spaces'
    }
  },
  profession: {
    type: String,
    required: [true, 'Please enter your profession'],
    maxLength: [50, 'Enter a maximum of 16 characters'],
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
      validator: (value) => validator.isMobilePhone(value, 'any'),
      message: 'Please enter a valid phone number',
      unique: [true, 'Sorry this phone number is already registered in our system']
    },
    countryCode: {
      type: String,
      enum: countryCodeEnum.values,
      required: [true, 'Please select a Country code']
    }
  },
  currency:{
    type: String,
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [8, 'Password length must be at least 8 characters'],
    validate: {
      validator: (value) => /\W/.test(value),
      message: 'Password must contain at least one special character'
    },
    select: false
  },
  country: {
    type: String,
    required: [true, 'Please select a country code'],
    enum: countryEnum
  },
  addressLine1: {
    type: String,
    required: [true, 'Please enter address line 1'],
    maxLength: [60, 'alphanumeric maximum 60 characters'],
    validate: {
      validator: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
      message: 'Address line 1 should contain alphanumeric characters and spaces only'
    }
  },
  addressLine2: {
    type: String,
    required: [true, 'Please enter address line 2'],
    maxLength: [60, 'alphanumeric maximum 60 characters'],
    validate: {
      validator: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
      message: 'Address line 2 should contain alphanumeric characters only'
    },
  },
  city: {
    type: String,
    required: [true, 'Please enter city'],
    maxLength: [20, 'City should not exceed 20 characters'],
    validate: {
      validator: (value) => /^[a-zA-Z0-9\s]+$/.test(value),
      message: 'City should contain alphanumeric characters only'
    },
  },
  code: {
    type: String,
    required: [true, 'Please enter your zip code'],
    maxLength: [10, 'alphanumeric maximum 10 characters'],
    validate: {
      validator: (value) => /^[a-zA-Z0-9]+$/.test(value),
      message: 'Code should contain alphanumeric characters only'
    },
  },
  userImage: {
    type: String
  },
  joinedAt: {
    type: String
  },
  averageValueTransacted: {
    type: String
  },
  timesReported: {
    type: String
  },
  tcs: {
    type: Boolean,
    required: [true, 'Terms and Conditions field cannot be left empty. Value must either be either true or false'],
    default: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordTime: Date
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema)