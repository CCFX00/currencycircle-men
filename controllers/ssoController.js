const passport = require("passport");
const User = require('../models/userModel')
const { sendToken, renewAccessToken, getResetPasswordToken } = require('../utils/cookies-JWT') 


exports.oAuth = passport.authenticate("google", { scope: ["profile", "email"] })

exports.oAuthRedirect = passport.authenticate("google", { failureRedirect: "/ccfx/api/v1/oauth/401" })

exports.oAuthRedirectCallback = (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/ccfx/api/v1/oauth");
}

exports.loginSuccess = async (req, res) => {
    const user = await User.findOne({email: req.user._json.email})

    if(!user){
        return res.status(404).json({
            success: false,
            message: "User not found in our database. Please sign up first"
        })
    }

    await sendToken(user, res)

    return res.status(200).json({
        success: true,
        message: `CCFX User ${user.name} logged in successfully`
    })
}

exports.notFound = (req, res) => {
    res.status(401).json({
        success: false,
        message: "OAuth Authentication failed [Error recieving user], please try again"
    })
}