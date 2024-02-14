const emailValidator = function (value) {
    // Check if the email contains '@' and '.'
    return value.includes('@') && value.includes('.');
  };
  
const passwordValidator = function (value) {
    // Check if the password is alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(value)) {
      return false;
    }
  
    // Check if the password contains at least 1 special character
    const specialCharacterRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/;
    if (!specialCharacterRegex.test(value)) {
      return false;
    }
  
    return true;
  };


module.exports = authValidator
