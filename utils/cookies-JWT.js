const { generateAccessToken, generateRefreshToken, getResetToken } = require('./tokenLogic')
 
const sendToken = async(user, res) => {
    try{
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        res.cookie('access_token', accessToken, { expires: new Date(Date.now() + 1 * 60 * 1000), httpOnly: true })
        res.cookie('refresh_token', refreshToken, { expires: new Date(Date.now() + 2 * 60 * 1000), httpOnly: true })

    }catch(err){
        return {
            success: false,
            message: err.message
        }
    }
}

const getResetPasswordToken = async(user) => {
    return await getResetToken(user)
}


module.exports = {
    sendToken,
    getResetPasswordToken
}