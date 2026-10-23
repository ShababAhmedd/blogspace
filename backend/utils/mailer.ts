import nodemailer from "nodemailer";
import dotenv from "dotenv";
import getErrorMessage from "./getErrorMessage.ts";
dotenv.config();

const createTransport = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT ? Number(SMTP_PORT) : 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
};

// sends mail through SMTP when configured, otherwise logs it to the console
const sendMail = async (to: string, subject: string, html: string) => {
  const { SMTP_HOST, SMTP_USER, MAIL_FROM } = process.env;

  if (!SMTP_HOST) {
    console.log(`\n[mail] to: ${to}\n[mail] subject: ${subject}\n[mail] ${html}\n`);
    return;
  }

  await createTransport().sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
};

// run at startup so wrong SMTP settings show up in the console straight away
export const checkMailer = async () => {
  const { SMTP_HOST, SMTP_USER } = process.env;

  if (!SMTP_HOST) {
    console.log("[mail] SMTP is not configured: password-reset links will be printed in this console");
    return;
  }

  try {
    await createTransport().verify();
    console.log(`[mail] ready to send password-reset emails via ${SMTP_HOST}${SMTP_USER ? ` as ${SMTP_USER}` : ""}`);
  } catch (error) {
    console.error(`[mail] SMTP login failed: ${getErrorMessage(error)}`);
    console.error("[mail] password-reset emails can't be sent until the SMTP_* settings in backend/.env are fixed");
  }
};

export default sendMail;
