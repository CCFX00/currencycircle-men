const passport = require("passport");


exports.oAuth = passport.authenticate("google", { scope: ["profile", "email"] })

exports.oAuthRedirect = passport.authenticate("google", { failureRedirect: "/ccfx/api/v1/oauth/401" })

exports.oAuthRedirectCallback = (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/ccfx/api/v1/oauth");
}

exports.loginSuccess = (req, res) => {
    let name = req.user.displayName;
    res.status(200).json({
        success: true,
        message: `CCFX User ${name} logged in successfully`
    })
}

exports.logoutUser = (req, res) => {
    req.session.destroy();
    res.status(200).json({
        success: true,
        message: `User logged out successfully`
    })
}

exports.notFound = (req, res) => {
    res.status(401).json({
        success: false,
        message: "OAuth Authentication failed, please try again"
    })
}