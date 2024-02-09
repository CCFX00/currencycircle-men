const ErrorHandler = require("../utils/ErrorHandler")
const catchAsyncErrors = require("./catchAsyncErrors")
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const {jwt_token} = req.cookies

    if(!jwt_token){
        return next(new ErrorHandler("Please login to access these resources.", 401))
    }

    const decodedData = jwt.verify(jwt_token, process.env._JWT_SECRET_KEY )

    req.user = await User.findById(decodedData.id)

    next()
})