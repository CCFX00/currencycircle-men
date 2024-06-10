const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
  title: { type: String, required: true, default: 'CCFX Terms and Conditions'},
  content: { type: String, required: true },
  version: { type: String, required: true, unique: true },
  updated_at: { type: Date, default: Date.now }
});

const TermsAndConditions = mongoose.model('TermsAndCondition', termsAndConditionsSchema);

module.exports = TermsAndConditions;