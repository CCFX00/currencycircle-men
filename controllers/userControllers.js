const User = require('../models/userModel')
const ErrorHandler = require('../utils/ErrorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const Features = require('../utils/Features')
const jwt = require('jsonwebtoken')
const sendToken = require('../utils/cookies-JWT')

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
    res.status(20).json({
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
exports.createUser = catchAsyncErrors(async (req, res) => {
    const user = await User.create(req.body)
    sendToken(user, 201, res)
})

// login User
exports.loginUser = catchAsyncErrors( async(req, res, next) =>{
    const {email, password} = req.body

    if(!email || !password){
        return next(new ErrorHandler('Please enter your email and password', 400))
    }
    
    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler('User not found with this email and password', 401))
    }
    
    sendToken(user, 200, res)
})

// logout user
exports.logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.cookie("jwt_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message:"User logged out successfully"
    })
})