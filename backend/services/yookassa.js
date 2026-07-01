const { v4: uuidv4 } = require('uuid');

const YOOKASSA_API = 'https://api.yookassa.ru/v3';

const PLAN_CATALOG = {
  safe: {
    description: 'Тариф «Безопасный» — подписка 30 дней',
    defaultAmount: '690.00'
  },
  premium: {
    description: 'Тариф «Премиум» — подписка 30 дней',
    defaultAmount: '990.00'
  }
};

function isConfigured() {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function getAuthHeader() {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secret = process.env.YOOKASSA_SECRET_KEY;
  if (!shopId || !secret) return null;
  const token = Buffer.from(`${shopId}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

function getPlanAmount(plan) {
  const catalog = PLAN_CATALOG[plan];
  if (!catalog) return null;
  if (plan === 'safe' && process.env.YOOKASSA_SAFE_PRICE) {
    return Number(process.env.YOOKASSA_SAFE_PRICE).toFixed(2);
  }
  if (plan === 'premium' && process.env.YOOKASSA_PREMIUM_PRICE) {
    return Number(process.env.YOOKASSA_PREMIUM_PRICE).toFixed(2);
  }
  return catalog.defaultAmount;
}

function getFrontendBase() {
  return (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
}

async function yookassaRequest(path, options = {}) {
  const auth = getAuthHeader();
  if (!auth) {
    throw new Error('ЮKassa не настроена: задайте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY');
  }

  const { method = 'GET', body, idempotenceKey, headers: extraHeaders = {} } = options;

  const res = await fetch(`${YOOKASSA_API}${path}`, {
    method,
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey || uuidv4(),
      ...extraHeaders
    },
    body: body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.description || data?.type || JSON.stringify(data).slice(0, 200);
    throw new Error(`ЮKassa: ${detail}`);
  }
  return data;
}

async function createPayment({ plan, userId, userEmail }) {
  const amount = getPlanAmount(plan);
  const catalog = PLAN_CATALOG[plan];
  if (!amount || !catalog) {
    throw new Error('Некорректный тариф для оплаты');
  }

  const returnUrl = `${getFrontendBase()}/app/payment/return?plan=${encodeURIComponent(plan)}`;

  const payment = await yookassaRequest('/payments', {
    method: 'POST',
    idempotenceKey: uuidv4(),
    body: {
      amount: { value: amount, currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: returnUrl
      },
      description: catalog.description,
      metadata: {
        userId: String(userId),
        userEmail: String(userEmail || ''),
        plan: String(plan)
      }
    }
  });

  return {
    paymentId: payment.id,
    status: payment.status,
    confirmationUrl: payment.confirmation?.confirmation_url,
    amount
  };
}

async function getPayment(paymentId) {
  return yookassaRequest(`/payments/${paymentId}`, { method: 'GET' });
}

function getPlanFromPayment(payment) {
  const plan = payment?.metadata?.plan;
  if (plan === 'safe' || plan === 'premium') return plan;
  return null;
}

module.exports = {
  isConfigured,
  createPayment,
  getPayment,
  getPlanFromPayment,
  PLAN_CATALOG
};
