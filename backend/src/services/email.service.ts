import nodemailer from 'nodemailer';

export type EmailSendOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: EmailSendOptions): Promise<{ messageId: string }> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('EMAIL_NOT_CONFIGURED');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const response = await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject,
    text: text ?? 'MediBook notification',
    html,
  });

  return {
    messageId: response.messageId ?? 'unknown',
  };
}
