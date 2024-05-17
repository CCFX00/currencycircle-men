const ErrorHandler = require('../utils/ErrorHandler');

const checkTsCs = (obj) => {
    try {
        if (obj && obj.body && obj.method && obj.url) {
            const req = obj;
            const { tcs } = req.body;
            if (tcs !== true) {
                return {
                    success: false,
                    message: "Sorry, you need to accept Terms and Conditions to proceed."
                };
            }
        } else if (obj && obj.userName && obj.email) {
            const usr = obj;
            const { tcs } = usr;
            if (tcs !== true) {
                return {
                    success: false,
                    message: "Sorry, you need to accept Terms and Conditions to proceed."
                };
            }
        } else {
            return {
                success: false,
                message: "Invalid object passed to checkTsCs."
            };
        }
        return {
            success: true,
            message: "Terms and Conditions accepted."
        };
    } catch (error) {
        // Catch any unexpected errors
        throw new ErrorHandler('Error in checkTsCs function: ' + error.message, 500);
    }
};

module.exports = {
    checkTsCs
};
