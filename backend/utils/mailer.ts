import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// sends mail through SMTP when configured, otherwise logs it to the console
const sendMail = async (to: string, subject: string, html: string) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  if (!SMTP_HOST) {
    console.log(`\n[mail] to: ${to}\n[mail] subject: ${subject}\n[mail] ${html}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
};

export default sendMail;
