const nodemailer = require('nodemailer')
const mailgen = require('mailgen')


exports.sendMail = async(options) => {
    try{
        // setting up transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.AUTH_MAIL,
                pass: process.env.AUTH_PASS,
            }
        })

        let mailOptions = {
            from: process.env.AUTH_MAIL,
            to: options.email,
            subject: options.subject,
            html: options.message
        }

        await transporter.sendMail(mailOptions)    
    }catch(err){
        return {
            status: 'FAILED',
            message: err.message
        }
    }
}

exports.genMail = async(content) => {
    // Configure mailgen
    let mailGenerator = new mailgen({
        theme: 'default',
        product: {
            // Appears in header & footer of e-mails
            name: 'Currency Circle FX',
            link: 'https://mailgen.js/',
            copyright: 'Copyright © 2024 CCFX. All rights reserved.',
        }
    });

    return await mailGenerator.generate(content)
}
