import nodemailer from 'nodemailer';
import env from '../config/env.config';
import logger from './logger';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

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
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

const verifyEmailTransport = async (): Promise<void> => {
  await transporter.verify();
  logger.info('Email SMTP connection is ready');
};

const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
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

export default { sendMail, verifyEmailTransport };