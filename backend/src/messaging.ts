import { createTransport } from "nodemailer";
import { env, emailConfigured, whatsappConfigured } from "./config/env.js";

let transporter: ReturnType<typeof createTransport> | null = null;
function getTransporter() {
  if (!emailConfigured) return null;
  if (!transporter) {
    transporter = createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.secure,
      auth: { user: env.smtp.user, pass: env.smtp.pass }
    });
  }
  return transporter;
}

export type SendResult = { ok: boolean; channel: "email" | "whatsapp"; error?: string };

export async function sendOtpEmail(email: string, code: string): Promise<SendResult> {
  const t = getTransporter();
  if (!t) return { ok: false, channel: "email", error: "Email transport not configured" };
  const from = `"${env.smtp.fromName}" <${env.smtp.from}>`;
  const subject = `${code} is your StudyMaterial verification code`;
  const text =
    `Your StudyMaterial verification code is: ${code}\n\n` +
    `This code expires in 10 minutes. If you did not request it, you can ignore this email.`;
  const html =
    `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">` +
    `<h2 style="margin:0 0 4px;color:#0f172a">StudyMaterial</h2>` +
    `<p style="margin:0 0 20px;color:#64748b;font-size:14px">Verify your email to finish creating your account.</p>` +
    `<div style="font-size:34px;font-weight:800;letter-spacing:8px;color:#1d4ed8;background:#eff6ff;border-radius:12px;padding:16px;text-align:center">${code}</div>` +
    `<p style="margin:20px 0 0;color:#94a3b8;font-size:12px">This code expires in 10 minutes. If you did not request it, ignore this email.</p>` +
    `</div>`;
  try {
    await t.sendMail({ from, to: email, subject, text, html });
    return { ok: true, channel: "email" };
  } catch (e) {
    return { ok: false, channel: "email", error: e instanceof Error ? e.message : "Email send failed" };
  }
}

// Real Meta WhatsApp Cloud API sender. Active only when creds are present.
export async function sendOtpWhatsApp(phone: string, code: string): Promise<SendResult> {
  if (!whatsappConfigured) return { ok: false, channel: "whatsapp", error: "WhatsApp not configured" };
  const digits = phone.replace(/\D/g, "");
  const url = `https://graph.facebook.com/v21.0/${env.whatsapp.phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: digits,
    type: "template",
    template: {
      name: env.whatsapp.otpTemplate,
      language: { code: "en" },
      components: [
        { type: "body", parameters: [{ type: "text", text: code }] },
        { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: code }] }
      ]
    }
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.whatsapp.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { ok: false, channel: "whatsapp", error: `WhatsApp API ${res.status}: ${detail.slice(0, 200)}` };
    }
    return { ok: true, channel: "whatsapp" };
  } catch (e) {
    return { ok: false, channel: "whatsapp", error: e instanceof Error ? e.message : "WhatsApp send failed" };
  }
}
