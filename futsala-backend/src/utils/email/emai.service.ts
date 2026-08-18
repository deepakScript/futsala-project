import nodemailer from 'nodemailer';
import env from '../../config/env.config';
import logger from '../logger';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
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

export const verifyEmailTransport = async (): Promise<void> => {
  await transporter.verify();
  logger.info('Email SMTP connection is ready');
};

export const sendMail = async ({ to, subject, html, text }: SendMailOptions): Promise<nodemailer.SentMessageInfo> => {
  const mailOptions = {
    from: `Support <${env.MAIL_USER}>`,
    to,
    subject,
    html,
    ...(text ? { text } : {}),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`);
    return info;
  } catch (error: any) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};