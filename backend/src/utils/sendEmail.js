const nodemailer = require('nodemailer');

// Set up a mock transporter using Ethereal Email for development/testing
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return;
    }
    
    // Create a SMTP transporter object
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

const sendEmail = async (to, otp) => {
    if (!transporter) {
        console.log(`[MOCK EMAIL SEND] OTP for ${to} is ${otp}`);
        return;
    }

    const message = {
        from: 'Support <support@coreinventory.com>',
        to: to,
        subject: 'Password Reset OTP - CoreInventory',
        text: `Your OTP for resetting your password is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for resetting your password is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('OTP Email sent successfully');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (err) {
        console.error('Error sending OTP email:', err);
    }
};

module.exports = sendEmail;
