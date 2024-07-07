const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')
const User = require('../models/userModel');
const { verifyRefreshToken, renewAccessToken } = require('../utils/tokenLogic');

exports.isLoggedIn = (req, res, next) => {
    req.user ? next() : res.sendStatus(401); // unauthorized access 
}

exports.isVerifiedUser = async (req, res, next) => {
    const email = req.body.email
    const user = await User.findOne({email})

    if (!user.verified) {
        return next(new ErrorHandler('Please verify your account to access this resource', 400));
    }
};

exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {      
    const { access_token, refresh_token } = req.cookies
        
    if (!access_token) {
        return next(new ErrorHandler("Please login to access these resources", 401));
    }

    try {
        const decodedData = jwt.verify(access_token, process.env._JWT_ACCESS_SECRET_KEY);
        
        // Check if access token is about to expire
        const expirationTime = decodedData.exp * 1000; // Convert expiration time to milliseconds
        const currentTime = Date.now();
        const thresholdDuration = 60000; // 1 minute (in milliseconds)
        
        if (expirationTime - currentTime < thresholdDuration) {
            const { success, decoded } = await verifyRefreshToken(refresh_token);
            if (!success) {
                throw new ErrorHandler("Invalid refresh token", 401);
            }

            // Generate a new access token
            renewAccessToken(res, decoded);

            // Update the decoded data with the refresh token
            decodedData.id = decoded.id;
        }
        
        req.user = await User.findById(decodedData.id);
        next();
    } catch (err) {
        return next(err);
    }
});