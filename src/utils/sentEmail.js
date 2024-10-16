import nodemailer from "nodemailer";
const transporter=nodemailer.createTransport({
    host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_KEY,
  },
});
const sendMail=async(to,subject,body,htmlBody = null)=>{
    const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: to,
        subject: subject,
        text: body,
        // html:
      });
      return info;
}
export default sendMail;