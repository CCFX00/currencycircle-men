const mongoose = require('mongoose');

const termsAndConditionsSchema = new mongoose.Schema({
  title: String,
  content: String,
  version: String,
  updated_at: { type: Date, default: Date.now }
});

const TermsAndConditions = mongoose.model('TermsAndCondition', termsAndConditionsSchema);

const initialTermsAndConditions = {
  title: "Terms and Conditions",
  content: "These are the Terms and Conditions of the service. Please read them carefully.",
  version: "1.0",
  updated_at: Date.now()
};

// Create the initial Terms and Conditions document
TermsAndConditions.findOne()
  .then((result) => {
    if (!result) {
      TermsAndConditions.create(initialTermsAndConditions)
        .then(() => console.log('Initial Terms and Conditions created'))
        .catch((error) => console.error('Error creating initial Terms and Conditions:', error));
    }
  })
  .catch((error) => console.error('Error checking existing Terms and Conditions:', error));

module.exports = TermsAndConditions;