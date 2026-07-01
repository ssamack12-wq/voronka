function trimEnv(name) {
  return (process.env[name] || '').trim();
}

function isProductionEnv() {
  return (
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RAILWAY_ENVIRONMENT_NAME) ||
    Boolean(process.env.RAILWAY_PROJECT_ID)
  );
}

function getResendApiKey() {
  return trimEnv('RESEND_API_KEY') || null;
}

/** @returns {string | null} */
function getFromAddress() {
  const raw = trimEnv('RESEND_FROM_EMAIL');
  if (!raw) return null;
  if (raw.includes('<') && raw.includes('>')) return raw;
  const name = trimEnv('RESEND_FROM_NAME') || 'Навигатор сделки';
  return `${name} <${raw}>`;
}

function isResendConfigured() {
  return Boolean(getResendApiKey() && getFromAddress());
}

function getResendStatus() {
  const apiKey = getResendApiKey();
  const from = getFromAddress();
  if (!apiKey) return { ok: false, reason: 'RESEND_API_KEY missing' };
  if (!from) return { ok: false, reason: 'RESEND_FROM_EMAIL missing' };
  return { ok: true, from };
}

module.exports = {
  isProductionEnv,
  getResendApiKey,
  getFromAddress,
  isResendConfigured,
  getResendStatus
};
