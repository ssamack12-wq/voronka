const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify({ users: {}, magicTokens: {}, otpCodes: {}, deals: {}, consultations: [] }, null, 2)
    );
  }
}

function readStore() {
  ensureStore();
  return JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
}

function writeStore(store) {
  ensureStore();
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function upsertUser(email) {
  const store = readStore();
  const key = email.toLowerCase();
  if (!store.users[key]) {
    store.users[key] = {
      id: uuidv4(),
      email: key,
      premiumStatus: 'free',
      createdAt: new Date().toISOString()
    };
    writeStore(store);
  }
  return store.users[key];
}

function getUserById(id) {
  const store = readStore();
  return Object.values(store.users).find((u) => u.id === id) || null;
}

function setUserPremiumStatus(userId, premiumStatus) {
  const store = readStore();
  const allowed = ['free', 'safe', 'premium', 'expired', 'admin'];
  const status = allowed.includes(premiumStatus) ? premiumStatus : 'free';
  const user = Object.values(store.users).find((u) => u.id === userId);
  if (!user) return null;
  user.premiumStatus = status;
  user.pendingPaymentId = null;
  user.pendingPaymentPlan = null;
  writeStore(store);
  return user;
}

function saveUserPendingPayment(userId, paymentId, plan) {
  const normalizedPlan = plan === 'safe' || plan === 'premium' ? plan : null;
  if (!normalizedPlan || !paymentId) return null;
  const store = readStore();
  const user = Object.values(store.users).find((u) => u.id === userId);
  if (!user) return null;
  user.pendingPaymentId = String(paymentId);
  user.pendingPaymentPlan = normalizedPlan;
  writeStore(store);
  return { paymentId: user.pendingPaymentId, plan: normalizedPlan };
}

function getUserPendingPayment(userId) {
  const user = getUserById(userId);
  if (!user?.pendingPaymentId) return null;
  const plan = user.pendingPaymentPlan;
  if (plan !== 'safe' && plan !== 'premium') return null;
  return { paymentId: String(user.pendingPaymentId), plan };
}

function clearUserPendingPayment(userId) {
  const store = readStore();
  const user = Object.values(store.users).find((u) => u.id === userId);
  if (!user) return;
  user.pendingPaymentId = null;
  user.pendingPaymentPlan = null;
  writeStore(store);
}

function saveMagicToken(email, token) {
  const store = readStore();
  store.magicTokens[token] = {
    email: email.toLowerCase(),
    expiresAt: Date.now() + 15 * 60 * 1000
  };
  writeStore(store);
}

function consumeMagicToken(token) {
  const store = readStore();
  const entry = store.magicTokens[token];
  if (!entry || entry.expiresAt < Date.now()) return null;
  delete store.magicTokens[token];
  writeStore(store);
  return entry.email;
}

function saveOtpCode(email, code) {
  const store = readStore();
  if (!store.otpCodes) store.otpCodes = {};
  store.otpCodes[email.toLowerCase()] = {
    code: String(code).trim(),
    expiresAt: Date.now() + 15 * 60 * 1000
  };
  writeStore(store);
}

function consumeOtpCode(email, code) {
  const store = readStore();
  const key = email.toLowerCase();
  const entry = store.otpCodes?.[key];
  if (!entry || entry.expiresAt < Date.now() || entry.code !== String(code).trim()) return null;
  delete store.otpCodes[key];
  writeStore(store);
  return key;
}

function getUserDealsMap(store, userId) {
  if (!store.dealsByUser) store.dealsByUser = {};
  if (!store.dealsByUser[userId]) {
    if (store.deals?.[userId]) {
      const legacy = store.deals[userId];
      store.dealsByUser[userId] = { [legacy.id || uuidv4()]: legacy };
      delete store.deals[userId];
    } else {
      store.dealsByUser[userId] = {};
    }
  }
  return store.dealsByUser[userId];
}

function listDeals(userId) {
  const store = readStore();
  const map = getUserDealsMap(store, userId);
  return Object.values(map).sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

function saveDealProgress(userId, progress) {
  const store = readStore();
  if (!progress) {
    store.dealsByUser = store.dealsByUser || {};
    delete store.dealsByUser[userId];
    if (store.deals) delete store.deals[userId];
    writeStore(store);
    return null;
  }
  const payload = {
    ...progress,
    id: progress.id || uuidv4(),
    updatedAt: new Date().toISOString()
  };
  const map = getUserDealsMap(store, userId);
  map[payload.id] = payload;
  writeStore(store);
  return payload;
}

function getDealProgress(userId, dealId) {
  const store = readStore();
  const map = getUserDealsMap(store, userId);
  if (dealId) return map[dealId] ?? null;
  const list = Object.values(map).sort((a, b) =>
    String(b.updatedAt).localeCompare(String(a.updatedAt))
  );
  return list[0] ?? null;
}

function deleteDealProgress(userId, dealId) {
  const store = readStore();
  const map = getUserDealsMap(store, userId);
  if (dealId) delete map[dealId];
  else {
    store.dealsByUser[userId] = {};
  }
  writeStore(store);
}

function searchUsers(query, limit = 50) {
  const store = readStore();
  const q = String(query ?? '').trim().toLowerCase();
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 100);
  let users = Object.values(store.users);
  if (q) {
    users = users.filter(
      (u) => u.email.includes(q) || String(u.id).toLowerCase() === q || String(u.id).includes(q)
    );
  }
  return users
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .slice(0, cap);
}

function deleteUserById(userId) {
  const store = readStore();
  const user = Object.values(store.users).find((u) => u.id === userId);
  if (!user) return;
  delete store.users[user.email];
  if (store.dealsByUser) delete store.dealsByUser[userId];
  if (store.deals) delete store.deals[userId];
  if (store.otpCodes) delete store.otpCodes[user.email];
  if (store.magicTokens) {
    for (const [token, entry] of Object.entries(store.magicTokens)) {
      if (entry.email === user.email) delete store.magicTokens[token];
    }
  }
  if (store.consultations) {
    store.consultations = store.consultations.map((c) =>
      c.userId === userId ? { ...c, userId: null } : c
    );
  }
  writeStore(store);
}

function addConsultation(payload) {
  const store = readStore();
  const row = {
    id: uuidv4(),
    ...payload,
    createdAt: new Date().toISOString()
  };
  store.consultations.push(row);
  writeStore(store);
  return row;
}

module.exports = {
  upsertUser,
  getUserById,
  setUserPremiumStatus,
  saveUserPendingPayment,
  getUserPendingPayment,
  clearUserPendingPayment,
  searchUsers,
  deleteUserById,
  saveMagicToken,
  consumeMagicToken,
  saveOtpCode,
  consumeOtpCode,
  listDeals,
  saveDealProgress,
  getDealProgress,
  deleteDealProgress,
  addConsultation
};
