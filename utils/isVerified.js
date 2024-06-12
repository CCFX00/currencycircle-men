const ErrorHandler = require('./ErrorHandler')

const verifyUser = async (user) => {
    if (!user.verified) {
        throw new ErrorHandler('Please verify your account to login', 400);
    }
};

module.exports = verifyUser;