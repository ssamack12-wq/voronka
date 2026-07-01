const ADMIN_USER_ID = '2ff0cfc1-796e-4fc6-8efc-59f84aa31bbb';

const SUBSCRIPTION_STATUSES = ['free', 'safe', 'premium', 'expired', 'admin'];

function getAdminEmails() {
  const defaults = ['gartem2109@yandex.ru'];
  const fromEnv = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...defaults, ...fromEnv])];
}

function isAdminUser(user) {
  if (!user) return false;
  const email = String(user.email ?? '').trim().toLowerCase();
  return getAdminEmails().includes(email) || user.id === ADMIN_USER_ID;
}

function normalizeSubscriptionStatus(raw) {
  const status = String(raw ?? '').trim().toLowerCase();
  return SUBSCRIPTION_STATUSES.includes(status) ? status : null;
}

module.exports = {
  getAdminEmails,
  ADMIN_USER_ID,
  SUBSCRIPTION_STATUSES,
  isAdminUser,
  normalizeSubscriptionStatus
};
