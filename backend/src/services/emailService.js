const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured; emails will be logged, not sent.');
    return null;
  }
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL SKIPPED - no config] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error(`Failed to send email to ${to}: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

async function notifyOwnerHighMatch({ ownerEmail, tenantName, listingLocation, score }) {
  return sendEmail({
    to: ownerEmail,
    subject: `Strong match (${score}/100) for your listing in ${listingLocation}`,
    html: `<p>Good news! <strong>${tenantName}</strong> expressed interest in your listing in <strong>${listingLocation}</strong> with a compatibility score of <strong>${score}/100</strong>.</p><p>Log in to review and respond.</p>`,
  });
}

async function notifyTenantInterestUpdate({ tenantEmail, listingLocation, decision }) {
  const verb = decision === 'accepted' ? 'accepted' : 'declined';
  return sendEmail({
    to: tenantEmail,
    subject: `Your interest request was ${verb}`,
    html: `<p>The owner has <strong>${verb}</strong> your interest request for the listing in <strong>${listingLocation}</strong>.</p>${
      decision === 'accepted' ? '<p>You can now chat with the owner directly on the platform.</p>' : ''
    }`,
  });
}

module.exports = { sendEmail, notifyOwnerHighMatch, notifyTenantInterestUpdate };
