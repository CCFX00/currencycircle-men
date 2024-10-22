const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Configuring hashing mechanism for crypto
const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env._ENCRYPTION_KEY, 'hex');
const iv = crypto.randomBytes(16);

const encryptValue = async (value) => {
    const hashedValue = await bcrypt.hash(value, await bcrypt.genSalt(10));
    return hashedValue;
}

const decryptValue = async (enteredValue, hashedValue) => {
    return await bcrypt.compare(enteredValue, hashedValue);
}

const encryptMessage = async (message) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

const decryptMessage = async (encryptedMessage, ivHex) => {
    let decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encryptedMessage, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


module.exports = {
    encryptValue,
    decryptValue,
    encryptMessage,
    decryptMessage
}