const { Resend } = require('resend');
const { buildLoginEmail } = require('./loginEmailTemplate');
const {
  getResendApiKey,
  getFromAddress,
  isResendConfigured,
  isProductionEnv
} = require('./resendConfig');

/**
 * @returns {{ sent: boolean, devMode?: boolean, messageId?: string }}
 */
async function sendLoginEmail({ email, verifyUrl, code }) {
  const { subject, html, text } = buildLoginEmail({ verifyUrl, email, code });

  if (!isResendConfigured()) {
    if (isProductionEnv()) {
      throw new Error(
        'Resend не настроен: задайте RESEND_API_KEY и RESEND_FROM_EMAIL в переменных окружения бэкенда (Railway → backend service → Variables)'
      );
    }
    console.info(`[auth:dev] ${email} code=${code} -> ${verifyUrl}`);
    return { sent: false, devMode: true };
  }

  const resend = new Resend(getResendApiKey());
  const from = getFromAddress();

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject,
    html,
    text
  });

  if (error) {
    console.error('[resend] send failed:', JSON.stringify(error));
    const detail = error.message || error.name || 'unknown error';
    throw new Error(`Resend: ${detail}`);
  }

  if (!data?.id) {
    console.warn('[resend] no message id in response', data);
  }

  console.info(`[resend] sent to ${email}, id=${data?.id ?? 'n/a'}, from=${from}`);
  return { sent: true, messageId: data?.id };
}

module.exports = { sendLoginEmail, isResendConfigured };
