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

function shell(heading: string, accent: string, bodyHtml: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px">` +
    `<h2 style="margin:0 0 4px;color:#0f172a">StudyMaterial</h2>` +
    `<p style="margin:0 0 18px;color:${accent};font-size:15px;font-weight:bold">${heading}</p>` +
    `<div style="color:#334155;font-size:14px;line-height:1.7">${bodyHtml}</div>` +
    `</div>`;
}

async function sendHtml(to: string, subject: string, html: string): Promise<SendResult> {
  const t = getTransporter();
  if (!t) return { ok: false, channel: "email", error: "Email transport not configured" };
  try {
    await t.sendMail({ from: `"${env.smtp.fromName}" <${env.smtp.from}>`, to, subject, html });
    return { ok: true, channel: "email" };
  } catch (e) {
    return { ok: false, channel: "email", error: e instanceof Error ? e.message : "Email send failed" };
  }
}

/** Sent to each admin when a new instructor application is submitted. */
export function sendInstructorReviewRequest(adminEmail: string, applicantName: string, applicantEmail: string): Promise<SendResult> {
  return sendHtml(
    adminEmail,
    `New instructor application: ${applicantName}`,
    shell("A new instructor application needs your review.", "#1d4ed8",
      `<p><strong>${applicantName}</strong> (${applicantEmail}) has applied to teach on StudyMaterial.</p>` +
      `<p>Open the admin console and use the <strong>Instructor Applications</strong> tab to approve or reject it. The applicant cannot access the instructor dashboard until you approve.</p>` +
      `<p style="color:#94a3b8;font-size:12px">Automated notification — do not reply to this email.</p>`)
  );
}

/** Sent to the applicant when an admin approves or rejects their application. */
export function sendInstructorDecisionEmail(
  email: string,
  name: string,
  decision: "approved" | "rejected",
  note?: string
): Promise<SendResult> {
  if (decision === "approved") {
    return sendHtml(
      email,
      "Your StudyMaterial instructor account is approved",
      shell("Congratulations — you are approved.", "#047857",
        `<p>Hi ${name}, an administrator approved your instructor application.</p>` +
        `<p>Your instructor account is now active. Sign in from the <strong>Teacher login</strong> page with the email and password you used in the application to open your dashboard.</p>` +
        (note ? `<p style="margin-top:12px"><strong>Reviewer note:</strong> ${note}</p>` : "") +
        `<p style="color:#94a3b8;font-size:12px">Automated notification — do not reply to this email.</p>`)
    );
  }
  return sendHtml(
    email,
    "Update on your StudyMaterial instructor application",
    shell("Your application was not approved.", "#be123c",
      `<p>Hi ${name}, an administrator reviewed your instructor application and could not approve it.</p>` +
      (note ? `<p style="margin-top:12px"><strong>Reason:</strong> ${note}</p>` : `<p style="margin-top:12px">No reason was provided.</p>`) +
      `<p>You can submit a new application with updated details from the instructor registration page.</p>` +
      `<p style="color:#94a3b8;font-size:12px">Automated notification — do not reply to this email.</p>`)
  );
}

