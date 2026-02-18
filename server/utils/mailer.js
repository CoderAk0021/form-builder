import nodemailer from "nodemailer";
import { MailtrapClient } from "mailtrap";

let smtpTransporter = null;
let mailtrapClient = null;

function resolveSecureFlag() {
  if (typeof process.env.SMTP_SECURE === "string") {
    return process.env.SMTP_SECURE.toLowerCase() === "true";
  }
  return Number(process.env.SMTP_PORT || 587) === 465;
}

function parseBoolean(value) {
  return typeof value === "string" && value.toLowerCase() === "true";
}

function getSenderEmail() {
  return (
    process.env.SMTP_FROM ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.MAILTRAP_FROM ||
    null
  );
}

function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: resolveSecureFlag(),
    auth: { user, pass },
  });

  return smtpTransporter;
}

function getMailtrapClient() {
  if (mailtrapClient) return mailtrapClient;
  const token = process.env.MAIL_TOKEN || process.env.MAILTRAP_API_KEY;
  if (!token) return null;

  const useSandbox = parseBoolean(process.env.MAILTRAP_USE_SANDBOX);
  const inboxId = Number(process.env.MAILTRAP_INBOX_ID);

  mailtrapClient = new MailtrapClient({
    token,
    sandbox: useSandbox,
    testInboxId: useSandbox && Number.isFinite(inboxId) ? inboxId : undefined,
  });

  return mailtrapClient;
}

function formatSubmittedAt(value) {
  try {
    return new Date(value).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

function applyTemplate(template, tokens) {
  let output = template;
  for (const [key, value] of Object.entries(tokens)) {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    output = output.replace(pattern, value);
  }
  return output;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeUrl(value) {
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  return "#";
}

function renderInlineMarkdown(value) {
  return value
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, text, href) =>
        `<a href="${sanitizeUrl(href)}" target="_blank" rel="noopener noreferrer" style="color:#0891b2;text-decoration:underline;">${text}</a>`,
    )
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>");
}

function renderMarkdownToEmailHtml(value) {
  const lines = escapeHtml(value || "").split(/\r?\n/);
  const output = [];
  let inUl = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inUl) {
        output.push("</ul>");
        inUl = false;
      }
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      if (inUl) {
        output.push("</ul>");
        inUl = false;
      }
      const level = heading[1].length;
      output.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      if (!inUl) {
        output.push("<ul>");
        inUl = true;
      }
      output.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      continue;
    }

    if (inUl) {
      output.push("</ul>");
      inUl = false;
    }

    output.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  if (inUl) output.push("</ul>");
  return output.join("");
}

export async function sendSubmissionReceipt({
  to,
  name,
  formTitle,
  submittedAt,
  subjectTemplate,
  messageTemplate,
}) {
  const smtpMailer = getSmtpTransporter();
  const tokenMailer = getMailtrapClient();
  const fromEmail = getSenderEmail();
  if (!fromEmail) return { sent: false, reason: "missing_sender_email" };

  const tokens = {
    name: name || String(to).split("@")[0],
    email: to,
    formTitle: formTitle || "Form",
    submittedAt: formatSubmittedAt(submittedAt),
  };

  const subject = applyTemplate(
    subjectTemplate || "Your response to {{formTitle}} was received",
    tokens,
  ).slice(0, 200);

  const text = applyTemplate(
    messageTemplate ||
      'Hi {{name}},\n\nThank you for completing "{{formTitle}}". We have recorded your submission on {{submittedAt}}.',
    tokens,
  );

  const html = `<div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">${renderMarkdownToEmailHtml(text)}</div>`;

  if (smtpMailer) {
    await smtpMailer.sendMail({
      from: fromEmail,
      to,
      subject,
      text,
      html,
    });
    return { sent: true, provider: "smtp" };
  }

  if (tokenMailer) {
    await tokenMailer.send({
      from: { email: fromEmail, name: process.env.MAIL_FROM_NAME || "Easy Forms" },
      to: [{ email: to }],
      subject,
      text,
      html,
      category: "submission_receipt",
    });
    return { sent: true, provider: "mailtrap" };
  }
  return { sent: false, reason: "missing_mailer_config" };
}

export function getMailStatus() {
  const hasSmtp =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_USER) &&
    Boolean(process.env.SMTP_PASS);
  const hasMailtrapToken = Boolean(process.env.MAIL_TOKEN || process.env.MAILTRAP_API_KEY);
  const senderEmail = getSenderEmail();

  let provider = null;
  if (hasSmtp) provider = "smtp";
  else if (hasMailtrapToken) provider = "mailtrap";

  return {
    configured: Boolean(provider && senderEmail),
    provider,
    senderEmail,
    missing: {
      senderEmail: !senderEmail,
      smtpConfig: !hasSmtp,
      mailtrapToken: !hasMailtrapToken,
    },
  };
}
