const passport = require("passport");
const User = require('../models/userModel')
const { sendToken } = require('../utils/cookies-JWT')
const { checkTsCs } = require('../utils/checkTsCs') 


exports.oAuth = passport.authenticate("google", { scope: ["profile", "email"] })

exports.oAuthRedirect = passport.authenticate("google", { failureRedirect: "/ccfx/api/v1/oauth/401" })

exports.oAuthRedirectCallback = (req, res) => {
    // Successful authentication, redirect home.
    // res.redirect("/ccfx/api/v1/oauth"); // redirect to ccfx backend
    res.redirect("http://localhost:5000/oauth"); // redirect to POC app
}

exports.loginSuccess = async (req, res) => {
    const user = await User.findOne({email: req.user._json.email})

    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found in our database. Please sign up first"
        })
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
            message: "User logged in successfully",
            user
        })
    } 
}

exports.notFound = (req, res) => {
    res.status(401).json({
        success: false,
        message: "OAuth Authentication failed [Error recieving user], please try again"
    })
}