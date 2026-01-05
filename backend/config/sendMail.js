import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendMail = async ({ email, subject, html }) => {
  const transport = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 2525,            
    secure: false,
    auth: {
      user: "api",
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 10000, 
  });

  await transport.sendMail({
    from: '"SmartKhata" <no-reply@smartkhata.me>',
    to: email,
    subject,
    html,
  });

};

export default sendMail;