import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    }
});
export const SendOTP = (email) => {
    const OTP = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Sending email for OTP verification",
        text: `OTP: ${OTP}`
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                reject("Email not sent");
            } else {
                resolve(OTP);
            }
        });
    });
};
