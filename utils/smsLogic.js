const twilio = require('twilio')

const sendSMS = async(number, bdy, otp) =>{
    try{
        if(!otp){
            const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

            const message = await client.messages
            .create({
                body: bdy,
                from: `${process.env.TWILIO_PHONE_NUMBER}`,
                to: `${number}`
            })

            return message
        }else{
            const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

            const message = await client.messages
            .create({
                body: `-: Hi there!\nHere's your CCFX one time password:\n${otp} \nValid 1 hour.`,
                from: `${process.env.TWILIO_PHONE_NUMBER}`,
                to: `${number}`
            })

            return message
        }
    }catch(e){
        return {
            sucess: false,
            error: e.message || 'SMS message was not sent'
        }
    }
}


module.exports = {
    sendSMS
}