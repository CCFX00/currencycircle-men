const VerificationOTP = require("../models/verificationOTPModel")
const { encryptValue, decryptValue } = require('./hashingLogic')
const verificationOTPModel = require('../models/verificationOTPModel');
const User = require('../models/userModel')
const { sendMail, genMail } = require('./sendMail') 

// Generate OTP
const genOTP = async() => {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`    
    return { otp }
}

// Send OTP
const sendOTP = async(user) => {
    try{
        const { otp } = await genOTP()
        const hashedOTP = await encryptValue(otp)

        let content = {
            body: {
                name: `${user.userName}`,
                intro: 'Welcome to Currency Circle FX',
                outro: `<p>Please use code below to verify your account:</p>
                <p><br/><strong><h1 style="text-align: center;">${otp}</h1></strong></p>
                <p><br/>Code valid for <b>1 hour</b></p>
                <p>Please keep it safe, do not share it with anyone</p>                
                `
            }
        };

        let mail = await genMail(content)

        let mssg = {
            email: user.email,
            subject: "CCFX Verification: OTP",
            message: mail
        }

        const newOTPVerification = await VerificationOTP({
            userEmail: user.email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 
        })

        await newOTPVerification.save()
        await sendMail(mssg)

        return {
            status: 'PENDING',
            message: `Verification OTP email sent successfully to ${user.email}`
        }
    }catch(err){
        return {
            status: 'FAILED',
            message: err.message
        }
    }
}

//Verify OTP
const verifyOTP = async({ email, otp }) => {
    try{
        if(!email || !otp){
            throw new Error("Please enter your OTP and UserID you recieved via mail")
        }

        const otpRecord = await verificationOTPModel.find({ userEmail: email })

        if(otpRecord.length <= 0){
            // no records were found
            throw new Error("Account is invalid or has already been verified. Please signup or login")
        }
        // record exists
        const { expiresAt } = otpRecord[0]
        const hashedOTP = otpRecord[0].otp

        if(expiresAt < Date.now()) {
            //otp record is expired
            await otpRecord.deleteMany({ userEmail: email }).exec()
            throw new Error("OTP code is expired, please request a new one")
        }

        const validOTP = await decryptValue(otp.trim(), hashedOTP)

        if(!validOTP) {
            //invalid otp
            throw new Error("OTP code entered is invalid, check your inbox once more")
        }
        //otp provided is valid
        await User.updateOne({ email }, { verified: true })
        await verificationOTPModel.deleteMany({ userEmail: email })
        return {
            status: "VERIFIED",
            message: "Your accounnt has been verified successfully"
        }
    }catch(err){
        return {
            status: 'FAILED',
            message: err.message
        }
    }
}

const resendOTP = async({ email }) => {
    try{
        if(!email){
            throw new Error("Please enter the email you used to sign up")
        }
        await verificationOTPModel.deleteMany({ userEmail: email })
        const user = await User.findOne({ email })

        if(user){
            if(!user.verified === true){
                return await sendOTP(user)
            }else{
                return {
                    success: false,
                    message: `User ${user.userName} is already a verified user`
                }
            } 
        }else{
            throw new Error("Email not registered in database, please signup first")
        }     
    }catch(err){
        return {
            status: 'FAILED',
            message: err.message
        }
    }
}

module.exports = {
    genOTP,
    sendOTP,
    verifyOTP,
    resendOTP
}
