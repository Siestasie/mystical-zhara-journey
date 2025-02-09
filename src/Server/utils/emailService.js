
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

  const mailOptions = {
    from: 'verifkon@gmail.com',
    to: email,
    subject: 'Подтверждение вашей почты',
    text: `Перейдите по ссылке для подтверждения: ${verificationLink}`,
    html: `<p>Перейдите по <a href="${verificationLink}">ссылке</a> для подтверждения вашей почты.</p>`
  };

  await transporter.sendMail(mailOptions);
  console.log('Письмо отправлено на адрес:', email);
};
