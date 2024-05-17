const User = require('../models/userModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Features = require('../utils/Features')
const { uploadFile } = require('../utils/uploadFile')
const { encryptValue, decryptValue } = require('../utils/hashingLogic')
const { sendToken, getResetPasswordToken } = require('../utils/cookies-JWT')
const UserToken = require("../models/userTokenModel"); 
const { checkTsCs } = require('../utils/checkTsCs')

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

    if(success === false){
        res.status(401).json({
            success: success,
            message: message
        })
    }else{
        req.body.password = await encryptValue(req.body.password)
        const user = await User.create(req.body)    

        res.status(200).json({
            success: true,
            message: `User ${user.userName}, has been created successfully`,
            user
        })   
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