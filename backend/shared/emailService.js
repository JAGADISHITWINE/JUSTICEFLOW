const nodemailer = require('nodemailer');

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port,
    secure,
    auth: { user, pass }
  });
}

const FROM_HEADER = process.env.EMAIL_FROM || '"JusticeFlow Legal OS" <no-reply@justiceflow.com>';

async function sendEmail({ to, subject, html, text }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[EMAIL NOTICE] No SMTP credentials in .env. Email simulated:
To: ${to}
Subject: ${subject}
Text: ${text || ''}`);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_HEADER,
      to,
      subject,
      text,
      html
    });
    console.log(`[EMAIL SENT] Successfully sent to ${to} (MessageId: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message);
    return { sent: false, error: err.message };
  }
}

async function sendOtpEmail({ to, otp, purpose }) {
  const title = purpose || 'Account Verification Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #F1F5F9;">
        <h2 style="color: #0F172A; margin: 0; font-size: 22px;">JusticeFlow Legal OS</h2>
        <p style="color: #64748B; margin: 4px 0 0 0; font-size: 13px;">Security & Privilege Verification</p>
      </div>
      <div style="padding: 24px 0;">
        <h3 style="color: #1E293B; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          You requested a security verification code for your JusticeFlow account (<strong>${to}</strong>). Please use the one-time code below to proceed:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #F8FAFC; border: 2px dashed #3B82F6; border-radius: 10px; padding: 14px 32px; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #1D4ED8;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748B; font-size: 13px; line-height: 1.5;">
          ⏱ This code will expire in <strong>10 minutes</strong>. If you did not initiate this request, you can safely disregard this message.
        </p>
      </div>
      <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; text-align: center; font-size: 12px; color: #94A3B8;">
        Protected under Bar Council Rules of Professional Conduct & Privilege &bull; JusticeFlow
      </div>
    </div>
  `;
  const text = `JusticeFlow Security Code: ${otp}. Valid for 10 minutes.`;
  return sendEmail({ to, subject: `[JusticeFlow] ${otp} is your ${title}`, html, text });
}

async function sendClientWelcomeEmail({ to, clientName, tempPassword, portalUrl }) {
  const loginUrl = portalUrl || 'http://localhost:4200/portal/login';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #F1F5F9;">
        <h2 style="color: #0F172A; margin: 0; font-size: 22px;">JusticeFlow Client Portal</h2>
        <p style="color: #10B981; margin: 4px 0 0 0; font-size: 13px; font-weight: bold;">Client Access Credentials</p>
      </div>
      <div style="padding: 24px 0;">
        <h3 style="color: #1E293B; margin-top: 0;">Welcome, ${clientName}!</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">
          Your legal counsel has set up your confidential client self-service portal. You can now access your matter schedule, review invoices, and transmit sensitive legal documents securely.
        </p>
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Login Portal:</strong> <a href="${loginUrl}" style="color: #2563EB;">${loginUrl}</a></p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #334155;"><strong>Username (Email):</strong> <code style="color: #0F172A; font-weight: bold;">${to}</code></p>
          <p style="margin: 0; font-size: 14px; color: #334155;"><strong>Password / Security Code:</strong> <code style="color: #0F172A; font-weight: bold; background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${loginUrl}" style="background: #10B981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
            Sign In to Client Portal
          </a>
        </div>
        <p style="color: #64748B; font-size: 12px; line-height: 1.5;">
          Please retain these credentials in a secure place. If you have any inquiries regarding your matter, contact your lead counsel directly.
        </p>
      </div>
      <div style="border-top: 1px solid #F1F5F9; padding-top: 16px; text-align: center; font-size: 12px; color: #94A3B8;">
        Protected by Attorney-Client Privilege &bull; JusticeFlow Legal OS
      </div>
    </div>
  `;
  const text = `Welcome ${clientName}. Access your Client Portal at ${loginUrl}. Username: ${to}, Password: ${tempPassword}`;
  return sendEmail({ to, subject: `[JusticeFlow] Client Portal Access - Your Login Credentials`, html, text });
}

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendClientWelcomeEmail
};
