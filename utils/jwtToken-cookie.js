 const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken()

    // options for cookies    
    const options = {
        expires: new Date(
            Date.now() + 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    }

    // sending cookies in response
    res.status(statusCode).cookie('jwt_token', token, options).json({
        success: true,
        user,
        token
    })
 }

 module.exports = sendToken