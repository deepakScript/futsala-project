import nodemailer from 'nodemailer';
import env from '../config/env.config';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: env.MAIL_PORT,
    secure: false, // Use true for port 465, false for others (e.g., 587)
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASSWORD?.replace(/\s+/g, ''), // Remove any spaces from App Password
    },
    tls: {
      rejectUnauthorized: false, // only for development / Mailtrap
    },
  });

  const mailOptions = {
    from: `Support <${env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

export const sendEmail = sendMail;
export default sendMail;
