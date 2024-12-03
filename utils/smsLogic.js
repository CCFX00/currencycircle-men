const twilio = require('twilio')

const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const sendSMS = async(number, bdy, otp) =>{
    try{
        if(!otp){
            const message = await client.messages
            .create({
                body: bdy,
                from: `${process.env.TWILIO_PHONE_NUMBER}`,
                to: `${number}`
            }).then(
                // message => console.log(message.sid)
            )
            .catch(
                error => console.error(error)
            );

            return message
        }else{
            const message = await client.messages
            .create({
                body: `-: Hi there!\nHere's your CCFX one time password:\n${otp} \nValid 1 hour.`,
                from: `${process.env.TWILIO_PHONE_NUMBER}`,
                to: `${number}`
            }).then(
                // message => console.log(message.sid)
            )
            .catch(
                error => console.error(error)
            );

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