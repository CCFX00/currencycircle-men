const VerificationOTP = require("../models/verificationOTPModel")
const { encryptValue, decryptValue } = require('./hashingLogic')
const verificationOTPModel = require('../models/verificationOTPModel');
const User = require('../models/userModel')
const { sendMail, genMail } = require('./mailLogic') 

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
    if (!email || !otp) {
        throw new Error("Please provide your email and verification code sent to you");
    }

    const otpRecord = await verificationOTPModel.find({ userEmail: email });

    if (otpRecord.length <= 0) {
        throw new Error("Account is invalid or has already been verified. Please signup or login");
    }

    const { expiresAt } = otpRecord[0];
    const hashedOTP = otpRecord[0].otp;

    if (expiresAt < Date.now()) {
        await verificationOTPModel.deleteMany({ userEmail: email });
        throw new Error("OTP code is expired, please request a new one");
    }

    const validOTP = await decryptValue(otp.trim(), hashedOTP);

    if (!validOTP) {
        throw new Error("OTP code entered is invalid, check your inbox once more");
    }

    await User.updateOne({ email }, { verified: true });
    await verificationOTPModel.deleteMany({ userEmail: email });

    return {
        status: "VERIFIED",
        message: "Your account has been verified successfully"
    };
};



const resendOTP = async({ email }) => {
    if (!email) {
        throw new Error("Please enter the email you used to sign up");
    }

    await verificationOTPModel.deleteMany({ userEmail: email });

    const user = await User.findOne({ email });

    if (user) {
        if (!user.verified) {
            return await sendOTP(user);
        } else {
            throw new Error(`User ${user.userName}, with email: ${user.email}, is already a verified user`);
        }
    } else {
        throw new Error("Email not registered in database, please signup first");
    }
};


module.exports = {
    genOTP,
    sendOTP,
    verifyOTP,
    resendOTP
}
