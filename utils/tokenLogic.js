const jwt = require("jsonwebtoken");
const UserToken = require("../models/userTokenModel");

const generateAccessToken = async(user) => {
    try{          
        const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env._JWT_ACCESS_SECRET_KEY, {
        expiresIn: process.env._JWT_ACCESS_EXPIRATION
        });

        return accessToken
    }catch (err){
        return {
            err: true,
            message: err.message
        }
    }    
}

const generateRefreshToken = async (user) => {
    try {      
        const refreshToken = jwt.sign({ id: user._id, email: user.email }, process.env._JWT_REFRESH_SECRET_KEY, {
            expiresIn: process.env._JWT_REFRESH_EXPIRATION
        }); 

        await UserToken.updateOne(
            { userId: user._id },
            { $set: { token: refreshToken }},
            { upsert: true }
        );
  
        return refreshToken
    }catch (err) {
        return {
            err: true,
            message: err.message
        }
    };
};

const verifyRefreshToken = async (tkn) => {
    try{
        const userToken = await UserToken.findOne({ token: tkn })
    
        return new Promise((resolve, reject) => {
            if(!userToken){
                return reject({
                    success: false, 
                    message: "Refresh token not found in database or is expired"
                })
            }
            jwt.verify(tkn, process.env._JWT_REFRESH_SECRET_KEY, (err, decoded) => {
                if(err){
                    return reject({
                        success: false, 
                        message: "Invalid refresh token"
                    })
                }
                resolve({
                    success: true,                    
                    message: "Token verified successfully",
                    decoded
                })
            })
        })
    }catch(err){
        return {
            err: true,
            message: err.message
        }
    }
}

const renewAccessToken = (res, decoded) => {
    generateAccessToken(decoded).then(token => {
        res.cookie('access_token', token, { expires: new Date(Date.now() + 5 * 60 * 1000), httpOnly: true })
        return token
    }).catch((error) => {
        return {
            error: true,
            message: error.message,
        }
    })
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,    
    renewAccessToken
}
