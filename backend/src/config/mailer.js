const nodemailer = require('nodemailer');

// Gmail App Passwords are displayed in 4 space-separated groups (e.g. "pqgc taqr gngh yjrq").
// dotenv preserves those spaces, but Gmail's SMTP expects the raw 16 characters — so strip
// all whitespace, otherwise auth fails with "535 Username and Password not accepted".
const SMTP_PASS = (process.env.SMTP_PASS || '').replace(/\s+/g, '');
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: SMTP_PORT,
  // Port 465 uses implicit TLS; 587 uses STARTTLS (secure:false + requireTLS).
  secure: SMTP_PORT === 465,
  requireTLS: SMTP_PORT !== 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: SMTP_PASS,
  },
});

// Verify the SMTP connection at startup so misconfiguration is visible immediately
// in the backend console instead of only surfacing when the first invite is sent.
if (process.env.SMTP_USER && SMTP_PASS) {
  transporter.verify((err) => {
    if (err) {
      console.error('✗ SMTP error — invite emails will fail:', err.message);
    } else {
      console.log('✓ SMTP ready — invite emails enabled (' + process.env.SMTP_USER + ')');
    }
  });
} else {
  console.warn('⚠ SMTP not configured (SMTP_USER / SMTP_PASS missing) — invites will return a shareable link instead.');
}

async function sendInviteEmail({ to, role, inviteUrl, inviterName }) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  // Gmail rejects/drops mail whose From address isn't the authenticated account (or a
  // verified alias). So always send From the authenticated SMTP_USER, keeping a friendly
  // display name. SMTP_FROM is used only to override the display name if provided.
  const displayMatch = (process.env.SMTP_FROM || '').match(/^"?([^"<]+?)"?\s*</);
  const displayName = displayMatch ? displayMatch[1].trim() : 'Twin Lakes Lodge';
  const from = process.env.SMTP_USER
    ? `"${displayName}" <${process.env.SMTP_USER}>`
    : (process.env.SMTP_FROM || '"Twin Lakes Lodge" <no-reply@twinlakes.local>');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #eef2e4; margin: 0; padding: 40px 20px; }
    .card { background: #fafaf7; max-width: 520px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(27,53,32,0.08); }
    .header { background: #1b3520; padding: 32px 40px; }
    .logo { color: #c8a96e; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px; }
    .sub { color: rgba(255,255,255,0.6); font-size: 13px; margin: 4px 0 0; letter-spacing: 2px; text-transform: uppercase; font-family: sans-serif; }
    .body { padding: 36px 40px; }
    h2 { color: #1c2b1e; font-size: 22px; margin: 0 0 12px; }
    p { color: #5a6b5c; font-size: 15px; line-height: 1.6; margin: 0 0 16px; font-family: sans-serif; }
    .role-badge { display: inline-block; background: #eef2e4; color: #1b3520; border-radius: 20px; padding: 4px 14px; font-size: 13px; font-weight: 600; font-family: sans-serif; margin-bottom: 24px; }
    .btn { display: block; background: #1b3520; color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-align: center; font-size: 15px; font-weight: 600; font-family: sans-serif; margin: 24px 0; }
    .footer { padding: 20px 40px; border-top: 1px solid #dde7c8; }
    .footer p { font-size: 12px; color: #9db87a; margin: 0; font-family: sans-serif; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="logo">Twin Lakes</p>
      <p class="sub">Safari Lodge Management</p>
    </div>
    <div class="body">
      <h2>You've been invited</h2>
      <p>${inviterName} has invited you to join the Twin Lakes Safari Lodge Management System.</p>
      <span class="role-badge">Role: ${roleLabel}</span>
      <p>Click the button below to set up your account. This invite expires in 48 hours.</p>
      <a href="${inviteUrl}" class="btn">Accept Invitation →</a>
      <p style="font-size:13px;">Or copy this link: <span style="color:#1b3520;word-break:break-all;">${inviteUrl}</span></p>
    </div>
    <div class="footer">
      <p>If you were not expecting this invite, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

  return transporter.sendMail({ from, to, subject: 'Your invitation to Twin Lakes Lodge', html });
}

module.exports = { sendInviteEmail, transporter };
