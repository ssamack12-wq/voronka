const { getUserFromRequest, tryRefresh, publicUser } = require('./auth');
const { isAdminUser, normalizeSubscriptionStatus } = require('./admin');
const {
  searchUsers,
  getUserById,
  setUserPremiumStatus,
  deleteUserById
} = require('./store');

async function resolveUser(req, res) {
  let user = await getUserFromRequest(req);
  if (!user) user = await tryRefresh(req, res);
  return user;
}

async function requireAdmin(req, res) {
  const user = await resolveUser(req, res);
  if (!user) {
    res.status(401).json({ error: 'Требуется авторизация' });
    return null;
  }
  if (!isAdminUser(user)) {
    res.status(403).json({ error: 'Доступ запрещён' });
    return null;
  }
  return user;
}

function registerAdminRoutes(app) {
  app.get('/api/admin/me', async (req, res) => {
    try {
      const user = await resolveUser(req, res);
      if (!user) return res.status(401).json({ error: 'Требуется авторизация' });
      res.json({ ok: true, isAdmin: isAdminUser(user) });
    } catch (err) {
      console.error('[admin/me]', err);
      res.status(500).json({ error: 'Ошибка проверки доступа' });
    }
  });

  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const q = String(req.query.q ?? '').trim();
      const users = await searchUsers(q, 50);
      res.json({ ok: true, users: users.map(publicUser) });
    } catch (err) {
      console.error('[admin/users]', err);
      res.status(500).json({ error: 'Не удалось найти пользователей' });
    }
  });

  app.patch('/api/admin/users/:userId/subscription', async (req, res) => {
    try {
      if (!(await requireAdmin(req, res))) return;
      const userId = String(req.params.userId ?? '');
      const status = normalizeSubscriptionStatus(req.body?.premiumStatus ?? req.body?.status);
      if (!status) {
        return res.status(400).json({ error: 'Укажите статус: free, safe, premium, expired или admin' });
      }
      const existing = await getUserById(userId);
      if (!existing) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      const updated = await setUserPremiumStatus(userId, status);
      res.json({ ok: true, user: publicUser(updated) });
    } catch (err) {
      console.error('[admin/subscription]', err);
      res.status(500).json({ error: 'Не удалось обновить подписку' });
    }
  });

  app.delete('/api/admin/users/:userId', async (req, res) => {
    try {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const userId = String(req.params.userId ?? '');
      if (userId === admin.id) {
        return res.status(400).json({ error: 'Нельзя удалить свой аккаунт' });
      }
      const existing = await getUserById(userId);
      if (!existing) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      await deleteUserById(userId);
      res.json({ ok: true, deletedId: userId });
    } catch (err) {
      console.error('[admin/delete-user]', err);
      res.status(500).json({ error: 'Не удалось удалить аккаунт' });
    }
  });
}

module.exports = { registerAdminRoutes, isAdminUser };
