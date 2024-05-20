const User = require('../models/userModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Features = require('../utils/Features')
const { uploadFile } = require('../utils/uploadFile')
const { encryptValue, decryptValue } = require('../utils/hashingLogic')
const { sendToken } = require('../utils/cookies-JWT')
const UserToken = require("../models/userTokenModel"); 
const { checkTsCs } = require('../utils/checkTsCs')
const { genOTP, sendOTP, verifyOTP, resendOTP } = require('../utils/otpLogic')
const { sendMail, genMail } = require('../utils/sendMail')
const crypto = require("crypto");

// Getting all users
exports.getAllUsers = catchAsyncErrors(async (req, res) => {
    const users = await User.find()
    res.status(200).json({
        message: true,
        users
    })
})

// Getting user based on keyword
exports.getAllUserskeyword = catchAsyncErrors(async (req, res) => {
    const feature = new Features(User.find(), req.query).search().filter()
    const users = await feature.query
    res.status(200).json({
        message: true,
        users
    })
})

// Updating a user
exports.updateUser = catchAsyncErrors(async (req, res, next) => {
    let user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler('User is not found with this id', 404))
    }
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        userUnified: false
    })
    res.status(200).json({
        success: true,
        user
    })
})

// Deleting a user
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    let user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler('User is not found with this id', 404))
    }
    await user.deleteOne()
    res.status(200).json({
        success: true,
        message: 'User deleted successfully'
    })
})

// Single user details
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    let user = await User.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler('User is not found with this id', 404))
    }
  
    res.status(200).json({
        success: true,
        user
    })
})


// user authentication (Creating new user, login User, logout user)

// Creating new user
exports.createUser = catchAsyncErrors(async (req, res, next) => {
    const { success, message } = checkTsCs(req)

    if(!success === true){
        res.status(401).json({
            success,
            message
        })
    }else{
        const foundUser = await User.findOne({  email: req.body.email })

        if(!foundUser){
            req.body.password = await encryptValue(req.body.password)
            const user = await User.create(req.body)   
            const otp = await sendOTP(user)

            res.status(201).json({
                success: true,
                message: `User ${user.userName}, has been created successfully`,
                otp
            }) 
        }else{
            res.status(400).json({
                success: false,
                message: "User with the provided email already exists in the database"
            })
        }          
    }   
}) 

// Uploading user files to Google Drive
exports.fileUpload = catchAsyncErrors(async (req, res) => {
    try {
        const {body, files } = req;
        for (let f = 0; f < files.length; f += 1) {
            await uploadFile(body._id, files[f]);
        }
        res.status(200).json({
            message: 'File(s) uploaded successfully'
        });
    } catch (f) {
        res.send(f.message);
    }
})

// login User
exports.loginUser = catchAsyncErrors( async(req, res, next) =>{
    const {email, password} = req.body

    if(!email || !password){
        return next(new ErrorHandler('Please enter your email and password', 400))
    }
    
    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler('User not found with this email', 401))
    }

    const matchedPassword = await decryptValue(password, user.password)

    if(!matchedPassword){
        return next(new ErrorHandler('Password entered is incorrect', 401))
    }

    const { success, message } = checkTsCs(user)

    if(success === false){
        res.status(401).json({
            success: success,
            message: message
        })
    }else{
        await sendToken(user, res)
    
        res.status(200).json({
            message: "User logged in successfully"
        })
    }    
})

// logout user
exports.logoutUser = catchAsyncErrors(async(req, res, next) => { 
    const tkn = req.cookies.refresh_token
    await UserToken.deleteOne({token: tkn})
    res.clearCookie("access_token", { expires: new Date(Date.now()), httpOnly: true })
    res.clearCookie("refresh_token", { expires: new Date(Date.now()), httpOnly: true })

    req.session.destroy((err) => {
        if(err){
            return res.status(500).json({
                success: false,
                message: "Error destroying session" 
            })
        }
    })

    res.status(200).json({
        success: true,
        message: `User logged out successfully`
    })
})

// verify user account with OTP
exports.verifyUserOTP = catchAsyncErrors(async(req, res, next) => {
    const verificationStatus = await verifyOTP(req.body)
    res.status(200).json({
        verificationStatus
    })
})

// resend OTP verification code
exports.resendOTPCode = catchAsyncErrors(async(req, res, next) => {
    const verificationStatus = await resendOTP(req.body)
    res.status(200).json({
        verificationStatus
    })
})

// Forgot password
exports.forgotPassword = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findOne({email: req.body.email})

    if(!user){
        return next(new ErrorHandler('User not found with this email address', 404))
    }

    const { otp } = await genOTP()
    const hashedOTP =  crypto.createHash("sha256").update(otp).digest("hex")

    user.resetPasswordToken = hashedOTP
    user.resetPasswordTime = Date.now() + 15 * 60 * 1000

    await user.save({
        validateBeforeSave: false
    })

    try{
        let content = {
            body: {
                name: `${user.userName}`,
                intro: `Here's your Currency Circle FX reset password token`,
                outro: `<p>Please use code below to reset your password:</p>
                <p><br/><strong><h1 style="text-align: center;">${otp}</h1></strong></p>
                <p><br/>Code valid for <b>15 minutes.</b></p>
                <p>Please keep it safe, do not share it with anyone</p>
                `
            }
        };

        let mail = await genMail(content)

        let mssg = {
            email: user.email,
            subject: "CCFX Password Recovery",
            message: mail
        }

        await sendMail(mssg)

        res.json({
            success: true,
            message: `email sent to ${user.email} successfully`
        })
        
    }catch(e){
        user.resetPasswordToken = undefined
        user.resetPasswordTime = undefined

        await user.save({
            validateBeforeSave: false
        })

        return next(new ErrorHandler(e.message, 500))
    }
})

// Reset Password
exports.resetPassword = catchAsyncErrors(async(req, res, next) => {
    let otp = req.body.otp
    hashedOTP = crypto.createHash("sha256").update(otp).digest("hex")

    const user = await User.findOne({
        resetPasswordToken: hashedOTP,
        resetPasswordTime: {  $gt: Date.now() }
    })

    if (!user) {
        return next(new ErrorHandler("Reset Token is invalid or expired. Please try again."))
    }
    
    if (req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password fields do not match. Please try again."))
    }

    user.password = await encryptValue(req.body.password)

    user.resetPasswordToken = undefined
    user.resetPasswordTime = undefined

    await user.save()

    res.status(200).json({
        status: 'success',
        massage: "Password reset successfully"
    })
})
