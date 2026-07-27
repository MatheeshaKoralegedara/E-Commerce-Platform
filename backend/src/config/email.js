const { Resend } = require('resend');
const logger = require('./logger');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPasswordResetEmail(toEmail, resetUrl) {
  try {
    await resend.emails.send({
      from: 'Mercato <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Reset your password',
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetUrl}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch (err) {
    logger.error({ err }, 'Failed to send password reset email');
    throw err;
  }
}

module.exports = { sendPasswordResetEmail };