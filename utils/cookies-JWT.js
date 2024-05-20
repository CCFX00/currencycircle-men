const { generateAccessToken, generateRefreshToken, getResetToken } = require('./tokenLogic')
 
const sendToken = async(user, res) => {
    try{
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        res.cookie('access_token', accessToken, { expires: new Date(Date.now() + 5 * 60 * 1000), httpOnly: true })
        res.cookie('refresh_token', refreshToken, { expires: new Date(Date.now() + 15 * 60 * 1000), httpOnly: true })

    }catch(err){
        return {
            success: false,
            message: err.message
        }
    }
}


module.exports = {
    sendToken
}