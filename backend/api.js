const { getUserFromRequest, tryRefresh } = require('./auth');
const {
  saveDealProgress,
  getDealProgress,
  deleteDealProgress,
  listDeals,
  addConsultation
} = require('./store');

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveConsultationDealId(user, dealId) {
  if (!dealId || !user?.id) return null;
  const id = String(dealId);
  if (!UUID_RE.test(id)) return null;
  const existing = await getDealProgress(user.id, id);
  return existing ? id : null;
}
const { notifyConsultationCreated } = require('./services/notifications');

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

function registerApiRoutes(app) {
  app.get('/api/deals', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const deals = await listDeals(user.id);
      res.json({ deals });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось загрузить сделки' });
    }
  });

  app.put('/api/deals/progress', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const progress = req.body;
      if (!progress?.scenarioId) {
        await saveDealProgress(user.id, null);
        return res.json({ ok: true, progress: null });
      }
      const saved = await saveDealProgress(user.id, progress);
      res.json({ ok: true, progress: saved });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось сохранить прогресс' });
    }
  });

  app.get('/api/deals/progress', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const dealId = req.query.dealId ? String(req.query.dealId) : null;
      const progress = await getDealProgress(user.id, dealId);
      res.json({ progress: progress ?? null });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось загрузить прогресс' });
    }
  });

  app.delete('/api/deals/progress', async (req, res) => {
    try {
      const user = await requireUser(req, res);
      if (!user) return;
      const dealId = req.query.dealId ? String(req.query.dealId) : null;
      await deleteDealProgress(user.id, dealId);
      res.json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Не удалось удалить сделку' });
    }
  });

  app.post('/api/consultations', async (req, res) => {
    try {
      const user = await resolveUser(req, res);
      const { needType, message, phone, email, scenarioId, stepId, dealId } = req.body ?? {};
      if (!needType || !message?.trim()) {
        return res.status(400).json({ error: 'Заполните тип запроса и описание' });
      }
      const contactEmail = (email ?? user?.email ?? '').trim().toLowerCase();
      const contactPhone = (phone ?? '').trim();
      if (!contactPhone) {
        return res.status(400).json({ error: 'Укажите телефон' });
      }
      const phoneDigits = contactPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10 || phoneDigits.length > 11) {
        return res.status(400).json({ error: 'Некорректный номер телефона' });
      }
      if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
        return res.status(400).json({ error: 'Укажите корректный email' });
      }

      const resolvedDealId = await resolveConsultationDealId(user, dealId);

      const row = await addConsultation({
        userId: user?.id ?? null,
        userEmail: contactEmail,
        needType,
        message: message.trim(),
        phone: contactPhone,
        scenarioId: scenarioId ?? null,
        stepId: stepId ?? null,
        dealId: resolvedDealId
      });
      const notifyResult = await notifyConsultationCreated(row).catch((err) => {
        console.error('[notifications]', err);
        return { sheets: { ok: false, error: String(err) } };
      });

      if (!notifyResult.sheets?.ok && !notifyResult.sheets?.skipped) {
        return res.status(502).json({
          error:
            'Заявка сохранена, но не попала в Google Sheets. Проверьте GOOGLE_SCRIPT_URL на бэкенде.',
          id: row.id
        });
      }

      res.json({ ok: true, id: row.id, sheets: notifyResult.sheets?.ok ?? false });
    } catch (err) {
      console.error('[consultations]', err);
      res.status(500).json({ error: 'Не удалось отправить заявку' });
    }
  });
}

module.exports = { registerApiRoutes };
