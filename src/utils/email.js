import { Resend } from "resend";

export async function sendEmail(to, subject, html) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Email settings are not configured");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
