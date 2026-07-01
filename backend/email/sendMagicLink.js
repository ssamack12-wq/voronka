const { Resend } = require('resend');
const { buildMagicLinkEmail } = require('./magicLinkTemplate');

function getFromAddress() {
  const email = process.env.RESEND_FROM_EMAIL;
  if (!email) return null;
  const name = process.env.RESEND_FROM_NAME || 'Навигатор сделки';
  return `${name} <${email}>`;
}

function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getFromAddress());
}

/**
 * @returns {{ sent: boolean, devMode?: boolean, messageId?: string }}
 */
async function sendMagicLinkEmail({ email, verifyUrl }) {
  const { subject, html, text } = buildMagicLinkEmail({ verifyUrl, email });

  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_API_KEY не настроен');
    }
    console.info(`[magic-link:dev] ${email} -> ${verifyUrl}`);
    return { sent: false, devMode: true };
  }

  const from = getFromAddress();
  if (!from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('RESEND_FROM_EMAIL не настроен (нужен верифицированный домен в Resend)');
    }
    console.info(`[magic-link:dev] ${email} -> ${verifyUrl}`);
    return { sent: false, devMode: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
    text
  });

  if (error) {
    console.error('[resend]', error);
    throw new Error(error.message || 'Resend: не удалось отправить письмо');
  }

  console.info(`[resend] magic link sent to ${email}, id=${data?.id ?? 'n/a'}`);
  return { sent: true, messageId: data?.id };
}

module.exports = { sendMagicLinkEmail, isResendConfigured };
