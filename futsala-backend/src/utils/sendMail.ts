import nodemailer from "nodemailer";

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

const sendMail = async ({ to, subject, html }: SendMailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || "587", 10),
    secure: false, // Use true for port 465, false for others (e.g., 587)
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // only for development / Mailtrap
    },
  });

  const mailOptions = {
    from: `Support <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
    throw error;
  }
};

export default sendMail;
