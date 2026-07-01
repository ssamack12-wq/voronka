const { getUserFromRequest, tryRefresh, publicUser } = require('./auth');
const {
  getUserById,
  setUserPremiumStatus,
  saveUserPendingPayment,
  getUserPendingPayment,
  clearUserPendingPayment
} = require('./store');
const yookassa = require('./services/yookassa');

async function resolveUser(req, res) {
  let user = await getUserFromRequest(req);
  if (!user) user = await tryRefresh(req, res);
  return user;
}

async function requireUser(req, res) {
  const user = await resolveUser(req, res);
  if (!user) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return null;
  }
  return user;
}

function isPaymentComplete(status) {
  return status === 'succeeded' || status === 'waiting_for_capture';
}

function normalizePlanHint(raw) {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (value === 'safe' || value === 'premium') return value;
  if (value === 'безопасный' || value === 'безопасный тариф') return 'safe';
  if (value === 'премиум') return 'premium';
  return null;
}

function verifyPaymentOwnership(payment, user) {
  const metaUserId = String(payment?.metadata?.userId ?? '').trim();
  const metaEmail = String(payment?.metadata?.userEmail ?? '')
    .trim()
    .toLowerCase();
  if (metaUserId && metaUserId !== user.id) return false;
  if (metaEmail && metaEmail !== user.email) return false;
  return true;
}

async function applyPaymentSuccess(payment, sessionUserId, planOverride) {
  const plan =
    yookassa.getPlanFromPayment(payment) ||
    (planOverride === 'safe' || planOverride === 'premium' ? planOverride : null);
  const userId = String(sessionUserId || payment?.metadata?.userId || '').trim();

  if (!userId || !plan) {
    console.warn('[payments] skip apply: missing userId or plan', {
      userId: userId || null,
      plan,
      planOverride: planOverride || null,
      paymentId: payment?.id
    });
    return null;
  }

  const updated = await setUserPremiumStatus(userId, plan);
  if (!updated) {
    console.warn('[payments] user not found for apply', userId);
    return null;
  }

  return { plan, user: publicUser(updated) };
}

function sendNoCacheJson(res, payload, status = 200) {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(status).json(payload);
}

function registerPaymentRoutes(app) {
  app.get('/api/payments/config', (_req, res) => {
    res.json({
      enabled: yookassa.isConfigured(),
      plans: {
        safe: {
          amount: process.env.YOOKASSA_SAFE_PRICE || yookassa.PLAN_CATALOG.safe.defaultAmount,
          currency: 'RUB'
        },
        premium: {
          amount: process.env.YOOKASSA_PREMIUM_PRICE || yookassa.PLAN_CATALOG.premium.defaultAmount,
          currency: 'RUB'
        }
      }
    });
  });

  app.post('/api/payments/create', async (req, res) => {
    try {
      if (!yookassa.isConfigured()) {
        return res.status(503).json({
          error: 'Оплата не настроена. Задайте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY на бэкенде.'
        });
      }

      const user = await requireUser(req, res);
      if (!user) return;

      const plan = String(req.body?.plan ?? '');
      if (plan !== 'safe' && plan !== 'premium') {
        return res.status(400).json({ error: 'Укажите тариф safe или premium' });
      }

      const payment = await yookassa.createPayment({
        plan,
        userId: user.id,
        userEmail: user.email
      });

      if (!payment.confirmationUrl) {
        return res.status(502).json({ error: 'ЮKassa не вернула ссылку на оплату' });
      }

      await saveUserPendingPayment(user.id, payment.paymentId, plan);

      res.json({
        ok: true,
        paymentId: payment.paymentId,
        confirmationUrl: payment.confirmationUrl,
        amount: payment.amount,
        plan
      });
    } catch (err) {
      console.error('[payments/create]', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Не удалось создать платёж' });
    }
  });

  app.get('/api/payments/pending', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;

      const pending = await getUserPendingPayment(user.id);
      sendNoCacheJson(res, {
        ok: true,
        pending: pending ?? null
      });
    } catch (err) {
      console.error('[payments/pending]', err);
      res.status(500).json({ error: 'Не удалось загрузить ожидающий платёж' });
    }
  });

  app.get('/api/payments/:paymentId', async (req, res) => {
    try {
      if (!yookassa.isConfigured()) {
        return res.status(503).json({ error: 'Оплата не настроена' });
      }

      const user = await requireUser(req, res);
      if (!user) return;

      const paymentId = String(req.params.paymentId ?? '');
      const payment = await yookassa.getPayment(paymentId);

      if (!verifyPaymentOwnership(payment, user)) {
        return res.status(403).json({ error: 'Платёж принадлежит другому пользователю' });
      }

      const planOverride = normalizePlanHint(req.query.plan);

      let applied = null;
      if (isPaymentComplete(payment.status)) {
        applied = await applyPaymentSuccess(payment, user.id, planOverride);
      }

      const dbUser = await getUserById(user.id);
      const freshUser = applied?.user ?? (dbUser ? publicUser(dbUser) : user);
      res.json({
        ok: true,
        status: payment.status,
        plan: yookassa.getPlanFromPayment(payment),
        applied,
        user: freshUser
      });
    } catch (err) {
      console.error('[payments/status]', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Не удалось проверить платёж' });
    }
  });

  app.post('/api/payments/confirm', async (req, res) => {
    try {
      if (!yookassa.isConfigured()) {
        return res.status(503).json({ error: 'Оплата не настроена' });
      }

      const user = await requireUser(req, res);
      if (!user) return;

      let paymentId = String(req.body?.paymentId ?? '').trim();
      let planOverride = normalizePlanHint(req.body?.plan);

      if (!paymentId) {
        const stored = await getUserPendingPayment(user.id);
        if (stored) {
          paymentId = stored.paymentId;
          planOverride = planOverride ?? stored.plan;
        }
      }

      if (!paymentId) {
        return res.status(400).json({ error: 'Укажите paymentId или завершите оплату заново' });
      }

      const payment = await yookassa.getPayment(paymentId);
      if (!verifyPaymentOwnership(payment, user)) {
        return res.status(403).json({ error: 'Платёж принадлежит другому пользователю' });
      }

      if (!planOverride) {
        planOverride = normalizePlanHint(yookassa.getPlanFromPayment(payment));
      }

      if (!isPaymentComplete(payment.status)) {
        const dbUser = await getUserById(user.id);
        return res.json({
          ok: true,
          pending: true,
          activated: false,
          status: payment.status,
          plan: yookassa.getPlanFromPayment(payment) ?? planOverride,
          user: dbUser ? publicUser(dbUser) : user
        });
      }

      let applied = await applyPaymentSuccess(payment, user.id, planOverride);
      if (!applied && planOverride) {
        applied = await applyPaymentSuccess(
          { ...payment, metadata: { ...payment.metadata, plan: planOverride } },
          user.id,
          planOverride
        );
      }

      if (!applied) {
        console.error('[payments/confirm] payment complete but plan not applied', {
          paymentId,
          planOverride,
          metadata: payment.metadata
        });
        return res.status(500).json({
          error: 'Оплата прошла, но тариф не активирован. Обратитесь в поддержку.',
          paymentId
        });
      }

      await clearUserPendingPayment(user.id);
      const dbUser = await getUserById(user.id);
      const freshUser = applied.user ?? (dbUser ? publicUser(dbUser) : user);

      sendNoCacheJson(res, {
        ok: true,
        pending: false,
        activated: true,
        status: payment.status,
        plan: applied.plan,
        applied,
        user: freshUser
      });
    } catch (err) {
      console.error('[payments/confirm]', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Не удалось подтвердить оплату' });
    }
  });

  app.post('/api/payments/webhook', async (req, res) => {
    try {
      const event = req.body;
      // Some shops may receive "waiting_for_capture" before "succeeded".
      // We apply the plan as soon as the payment is effectively complete.
      if (
        (event?.event === 'payment.succeeded' ||
          event?.event === 'payment.waiting_for_capture') &&
        event?.object
      ) {
        const uid = event.object?.metadata?.userId;
        await applyPaymentSuccess(event.object, uid);
        console.info('[payments/webhook] succeeded', event.object.id, event.object.metadata?.plan);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('[payments/webhook]', err);
      res.status(500).json({ error: 'Webhook error' });
    }
  });
}

module.exports = { registerPaymentRoutes, applyPaymentSuccess };
