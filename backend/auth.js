const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const {
  upsertUser,
  getUserById,
  saveMagicToken,
  consumeMagicToken,
  saveOtpCode,
  consumeOtpCode
} = require('./store');
const { sendLoginEmail } = require('./email/sendLoginEmail');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET + '-refresh';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const ACCESS_MAX_AGE = 7 * 24 * 60 * 60;
const REFRESH_MAX_AGE = 90 * 24 * 60 * 60;
const OTP_LENGTH = 4;

function cookieOptions(maxAge) {
  const secure = process.env.NODE_ENV === 'production';
  const crossOrigin =
    secure &&
    FRONTEND_URL &&
    !FRONTEND_URL.includes('localhost') &&
    !FRONTEND_URL.includes('127.0.0.1');
  return {
    httpOnly: true,
    secure: secure || crossOrigin,
    sameSite: crossOrigin ? 'none' : 'lax',
    maxAge: maxAge * 1000,
    path: '/'
  };
}

function normalizeEmail(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return Boolean(email && email.includes('@') && email.length <= 254);
}

const allowedDomains = [
  'yandex.ru',
  'ya.ru',
  'mail.ru',
  'bk.ru',
  'inbox.ru',
  'list.ru',
  'vk.com',
  'internet.ru'
];

function getEmailDomain(email) {
  const at = email.lastIndexOf('@');
  if (at < 1) return null;
  return email.slice(at + 1);
}

function isAllowedEmailDomain(email) {
  const domain = getEmailDomain(email);
  return domain !== null && allowedDomains.includes(domain);
}

const DOMAIN_RESTRICTION_ERROR =
  'Для доступа к сервису используйте российскую электронную почту.\n\nПоддерживаются:\n• Яндекс Почта\n• Mail.ru\n• VK Почта\n\nЭто связано с требованиями российского законодательства.';

function getSecurityBypassEmails() {
  // Safety: do not allow bypass in production by default.
  // Enable explicitly via ENABLE_SECURITY_BYPASS=1 and SECURITY_BYPASS_EMAILS.
  const enabled =
    process.env.ENABLE_SECURITY_BYPASS === '1' ||
    process.env.ENABLE_SECURITY_BYPASS === 'true' ||
    process.env.NODE_ENV !== 'production';
  if (!enabled) return [];

  const fromEnv = (process.env.SECURITY_BYPASS_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(fromEnv)];
}

function isSecurityBypassEmail(email) {
  return getSecurityBypassEmails().includes(email);
}

function generateOtpCode() {
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

function buildVerifyUrl(token) {
  return `${FRONTEND_URL.replace(/\/$/, '')}/auth/verify?token=${encodeURIComponent(token)}`;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    premiumStatus: user.premiumStatus,
    createdAt: user.createdAt
  };
}

function sendNoCacheJson(res, payload, status = 200) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(status).json(payload);
}

function signTokens(user) {
  const access = jwt.sign({ sub: user.id, type: 'access' }, JWT_SECRET, { expiresIn: ACCESS_MAX_AGE });
  const refresh = jwt.sign({ sub: user.id, type: 'refresh', jti: uuidv4() }, REFRESH_SECRET, {
    expiresIn: REFRESH_MAX_AGE
  });
  return { access, refresh };
}

function extractAccessToken(req) {
  const header = req.headers.authorization;
  if (typeof header === 'string' && header.toLowerCase().startsWith('bearer ')) {
    return header.slice(7).trim();
  }
  return req.cookies?.tn_access ?? null;
}

function issueAuthSession(res, user) {
  const { access, refresh } = signTokens(user);
  res.cookie('tn_access', access, cookieOptions(ACCESS_MAX_AGE));
  res.cookie('tn_refresh', refresh, cookieOptions(REFRESH_MAX_AGE));
  return { user: publicUser(user), accessToken: access };
}

function clearAuthCookies(res) {
  const opts = cookieOptions(0);
  res.clearCookie('tn_access', opts);
  res.clearCookie('tn_refresh', opts);
}

async function loginUser(res, email) {
  const user = await upsertUser(email);
  return issueAuthSession(res, user);
}

async function getUserFromRequest(req) {
  const token = extractAccessToken(req);
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.type !== 'access') return null;
    const user = await getUserById(payload.sub);
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

async function tryRefresh(req, res) {
  const token = req.cookies?.tn_refresh;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    if (payload.type !== 'refresh') return null;
    const user = await getUserById(payload.sub);
    if (!user) return null;
    issueAuthSession(res, user);
    return publicUser(user);
  } catch {
    return null;
  }
}

function accessTokenForUser(user) {
  if (!user?.id) return null;
  return signTokens(user).access;
}

async function handleLoginRequest(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Укажите корректный email' });
    }

    if (!isAllowedEmailDomain(email)) {
      return res.status(400).json({ error: DOMAIN_RESTRICTION_ERROR });
    }

    if (isSecurityBypassEmail(email)) {
      const session = await loginUser(res, email);
      console.info(`[auth:bypass] immediate login for ${email}`);
      return res.json({ ok: true, immediate: true, emailSent: false, ...session });
    }

    await upsertUser(email);
    const token = uuidv4();
    const code = generateOtpCode();
    await saveMagicToken(email, token);
    await saveOtpCode(email, code);

    const verifyUrl = buildVerifyUrl(token);
    const mailResult = await sendLoginEmail({ email, verifyUrl, code });

    if (!mailResult.sent) {
      if (mailResult.devMode) {
        return res.json({
          ok: true,
          emailSent: false,
          immediate: false,
          devLink: verifyUrl,
          devCode: code
        });
      }
      return res.status(503).json({
        error:
          'Письмо не отправлено. Настройте RESEND_API_KEY и RESEND_FROM_EMAIL на сервисе API (бэкенд) в Railway.'
      });
    }

    res.json({ ok: true, emailSent: true, immediate: false });
  } catch (err) {
    console.error('[auth/request]', err);
    const message = err instanceof Error ? err.message : 'Не удалось отправить письмо';
    res.status(500).json({ error: message });
  }
}

function registerAuthRoutes(app) {
  app.post('/api/auth/request', handleLoginRequest);

  // обратная совместимость
  app.post('/api/auth/magic-link', handleLoginRequest);

  app.post('/api/auth/verify-code', async (req, res) => {
    try {
      const email = normalizeEmail(req.body?.email);
      const code = String(req.body?.code ?? '').trim();
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Укажите корректный email' });
      }
      if (!/^\d{4}$/.test(code)) {
        return res.status(400).json({ error: 'Введите 4-значный код из письма' });
      }

      const verifiedEmail = await consumeOtpCode(email, code);
      if (!verifiedEmail) {
        return res.status(400).json({ error: 'Неверный или просроченный код' });
      }

      const session = await loginUser(res, verifiedEmail);
      res.json({ ok: true, ...session });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка входа' });
    }
  });

  async function verifyMagicLinkToken(req, res) {
    try {
      const token = String(req.body?.token ?? req.query?.token ?? '');
      if (!token) {
        return res.status(400).json({ error: 'Ссылка недействительна' });
      }
      const email = await consumeMagicToken(token);
      if (!email) {
        return res.status(400).json({ error: 'Ссылка недействительна или истекла' });
      }
      const session = await loginUser(res, email);
      res.json(session);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ошибка входа' });
    }
  }

  app.post('/api/auth/verify', verifyMagicLinkToken);

  app.get('/api/auth/me', async (req, res) => {
    try {
      let sessionUser = await getUserFromRequest(req);
      if (!sessionUser) sessionUser = await tryRefresh(req, res);
      let user = null;
      let accessToken = null;
      if (sessionUser) {
        const dbUser = await getUserById(sessionUser.id);
        if (dbUser) {
          user = publicUser(dbUser);
          accessToken = accessTokenForUser(dbUser);
        }
      }
      sendNoCacheJson(res, { user, accessToken });
    } catch (err) {
      console.error(err);
      sendNoCacheJson(res, { error: 'Ошибка сессии' }, 500);
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    clearAuthCookies(res);
    sendNoCacheJson(res, { ok: true, user: null, accessToken: null });
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const sessionUser = await tryRefresh(req, res);
      if (!sessionUser) {
        return sendNoCacheJson(res, { error: 'Сессия истекла' }, 401);
      }
      const dbUser = await getUserById(sessionUser.id);
      if (!dbUser) {
        return sendNoCacheJson(res, { error: 'Сессия истекла' }, 401);
      }
      sendNoCacheJson(res, {
        ok: true,
        user: publicUser(dbUser),
        accessToken: accessTokenForUser(dbUser)
      });
    } catch (err) {
      console.error(err);
      sendNoCacheJson(res, { error: 'Ошибка обновления сессии' }, 500);
    }
  });
}

module.exports = {
  registerAuthRoutes,
  getUserFromRequest,
  tryRefresh,
  publicUser,
  isSecurityBypassEmail,
  extractAccessToken
};
