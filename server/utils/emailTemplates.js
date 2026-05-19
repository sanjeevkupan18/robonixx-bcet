// Reusable email HTML templates for Nodemailer

const baseStyles = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0B0F1A;
  color: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const headerStyles = `
  background: linear-gradient(135deg, #1F2A44 0%, #111827 100%);
  border-bottom: 1px solid rgba(93,173,226,0.2);
  padding: 28px 32px;
`;

const bodyStyles = `padding: 32px;`;
const footerStyles = `
  padding: 20px 32px;
  background: #05080F;
  border-top: 1px solid rgba(255,255,255,0.05);
  text-align: center;
`;

/**
 * Admin notification email when a contact form is submitted
 */
const contactNotificationTemplate = ({ name, email, subject, message }) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <div style="display:flex; align-items:center; gap:12px;">
      <div style="width:40px;height:40px;background:rgba(93,173,226,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🤖</div>
      <div>
        <p style="margin:0;font-size:11px;color:#5DADE2;font-family:monospace;letter-spacing:2px;">ROBONIXX NOTIFICATION</p>
        <h2 style="margin:4px 0 0;font-size:18px;color:white;">New Contact Message</h2>
      </div>
    </div>
  </div>
  <div style="${bodyStyles}">
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:80px;">From</td><td style="padding:8px 0;color:white;font-size:13px;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${email}" style="color:#5DADE2;">${email}</a></td></tr>
      <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Subject</td><td style="padding:8px 0;color:white;font-size:13px;">${subject}</td></tr>
    </table>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:20px;">
      <p style="margin:0 0 8px;font-size:12px;color:#64748b;font-family:monospace;">MESSAGE</p>
      <p style="margin:0;font-size:14px;color:#cbd5e1;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>
    <div style="margin-top:24px;">
      <a href="mailto:${email}?subject=Re: ${subject}" style="display:inline-block;padding:12px 24px;background:linear-gradient(135deg,#5DADE2,#A29BFE);color:#0B0F1A;font-weight:700;font-size:13px;text-decoration:none;border-radius:8px;">Reply to ${name}</a>
    </div>
  </div>
  <div style="${footerStyles}">
    <p style="margin:0;font-size:11px;color:#334155;font-family:monospace;">Robonixx Admin System &bull; ${new Date().toLocaleString()}</p>
  </div>
</div>
`;

/**
 * Auto-reply to the person who sent the contact form
 */
const contactAutoReplyTemplate = ({ name, message }) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <div style="text-align:center;">
      <div style="font-size:32px;margin-bottom:8px;">🤖</div>
      <h2 style="margin:0;font-size:22px;color:white;">Hey ${name}!</h2>
      <p style="margin:8px 0 0;color:#5DADE2;font-size:13px;font-family:monospace;">MESSAGE RECEIVED</p>
    </div>
  </div>
  <div style="${bodyStyles}">
    <p style="font-size:15px;color:#cbd5e1;line-height:1.7;margin-bottom:20px;">
      Thanks for reaching out to <strong style="color:white;">Robonixx</strong> 🚀 We've received your message and our team will get back to you within <strong style="color:#5DADE2;">24–48 hours</strong>.
    </p>
    <div style="background:rgba(93,173,226,0.05);border-left:3px solid #5DADE2;border-radius:0 8px 8px 0;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:11px;color:#5DADE2;font-family:monospace;">YOUR MESSAGE</p>
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="font-size:14px;color:#64748b;margin-top:24px;">
      In the meantime, follow us on social media to stay updated on our latest events and workshops!
    </p>
  </div>
  <div style="${footerStyles}">
    <p style="margin:0 0 8px;font-size:14px;color:#5DADE2;font-weight:600;">— Team Robonixx</p>
    <p style="margin:0;font-size:11px;color:#334155;font-family:monospace;">Where Innovation Meets Intelligence</p>
  </div>
</div>
`;

/**
 * Event reminder email template
 */
const eventReminderTemplate = ({ eventTitle, date, venue, registrationLink }) => `
<div style="${baseStyles}">
  <div style="${headerStyles}">
    <p style="margin:0 0 8px;font-size:11px;color:#A29BFE;font-family:monospace;letter-spacing:2px;">UPCOMING EVENT</p>
    <h2 style="margin:0;font-size:22px;color:white;">${eventTitle}</h2>
  </div>
  <div style="${bodyStyles}">
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 0;color:#64748b;font-size:13px;width:80px;">📅 Date</td><td style="padding:10px 0;color:white;font-size:13px;">${date}</td></tr>
      ${venue ? `<tr><td style="padding:10px 0;color:#64748b;font-size:13px;">📍 Venue</td><td style="padding:10px 0;color:white;font-size:13px;">${venue}</td></tr>` : ''}
    </table>
    ${registrationLink ? `<a href="${registrationLink}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#5DADE2,#A29BFE);color:#0B0F1A;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;">Register Now →</a>` : ''}
  </div>
  <div style="${footerStyles}">
    <p style="margin:0;font-size:11px;color:#334155;font-family:monospace;">Robonixx Club &bull; Build. Learn. Innovate.</p>
  </div>
</div>
`;

module.exports = { contactNotificationTemplate, contactAutoReplyTemplate, eventReminderTemplate };
