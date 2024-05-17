const bcrypt = require('bcryptjs');

const encryptValue = async (value) => {
    const hashedValue = await bcrypt.hash(value, await bcrypt.genSalt(10));
    return hashedValue;
}

const decryptValue = async (enteredValue, hashedValue) => {
    return await bcrypt.compare(enteredValue, hashedValue);
}


module.exports = {
    encryptValue,
    decryptValue
}