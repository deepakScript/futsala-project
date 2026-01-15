import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

const testEmail = async () => {
    console.log("Testing Email Configuration...");
    console.log("--------------------------------");
    
    const host = process.env.MAIL_HOST;
    const port = process.env.MAIL_PORT;
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASSWORD;

    console.log(`MAIL_HOST: ${host}`);
    console.log(`MAIL_PORT: ${port}`);
    console.log(`MAIL_USER: ${user}`);
    // Only show first and last relevant characters of password for privacy
    const hiddenPass = pass ? `${pass.substring(0, 2)}...${pass.substring(pass.length - 2)}` : "undefined";
    console.log(`MAIL_PASSWORD: ${hiddenPass}`);

    if (!host || !user || !pass) {
        console.error("❌ Missing configuration variables.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port || "587", 10),
        secure: false, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass, 
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log("\nAttempting to verify connection...");
        await transporter.verify();
        console.log("✅ Connection successful! Credentials are correct.");

        console.log("\nAttempting to send test email...");
        await transporter.sendMail({
            from: user, // sender address
            to: user, // list of receivers (sending to self)
            subject: "Test Email from Futsala Debugger",
            text: "If you receive this, your email configuration is correct!",
            html: "<b>If you receive this, your email configuration is correct!</b>",
        });
        console.log("✅ Test email sent successfully!");

    } catch (error) {
        console.error("❌ Error occurred:");
        console.error(error);
    }
};

testEmail();
