/**
 * Email helper — configure SMTP on Render for live delivery.
 * Env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ADMIN_EMAIL, FROM_EMAIL
 */
const isConfigured = () =>
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) return { ok: false, reason: 'no recipient' };

  if (!isConfigured()) {
    console.log('[email:skipped] SMTP not configured. Would send to:', to);
    console.log('[email:subject]', subject);
    console.log('[email:body]', text || html);
    return { ok: true, skipped: true };
  }

  try {
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error('[email:error]', err.message);
    return { ok: false, error: err.message };
  }
};

export const getAdminEmail = () =>
  process.env.ADMIN_EMAIL || 'vegetabletonnes@gmail.com';
