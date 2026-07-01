# Railway: два сервиса (фронт + бэк)

## Почему не деплоился один `frontend/`

В папке `frontend/` остались `server.js` и `COPY backend` в Dockerfile, но папки `backend/` там **нет** — она на уровень выше. Docker падал при сборке или старте.

Сейчас:

- **`backend/`** — только API
- **`frontend/`** — только статика после `vite build`

---

## 1. PostgreSQL

1. New → **PostgreSQL** в проекте Railway.

---

## 2. Сервис BACKEND

**Settings → Root Directory:** `backend`

**Variables:**

| Переменная | Значение |
|------------|----------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference) |
| `FRONTEND_URL` | публичный URL **фронта** (см. шаг 3, потом обновить) |
| `JWT_SECRET` | случайная строка 32+ |
| `REFRESH_SECRET` | другая случайная строка |
| `GOOGLE_SCRIPT_URL` | опционально (квиз → таблица) |
| `RESEND_API_KEY` | API key из [resend.com](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | верифицированный email, напр. `login@yourdomain.com` |
| `RESEND_FROM_NAME` | опционально, имя отправителя |
| `RESEND_APP_NAME` | опционально, название в письме |

**Не нужны на бэке:** `VITE_API_URL`, `VITE_*`

**Start command:** `node server.js` (или из Dockerfile)

**Проверка:** `https://ВАШ-API.up.railway.app/health` → `"db": "connected"`

---

## 3. Сервис FRONTEND

**Settings → Root Directory:** `frontend` (обязательно, не корень репо)

**Dockerfile:** `Dockerfile.static` (в `railway.json`; без `COPY backend`)

**Start command:** `npm start` (или пусто — из Dockerfile). **Не** `serve dist ...` напрямую — будет `serve: not found`. Не ставьте `node server.js` — это бэкенд.

**Белый экран:** откройте домен **фронта**, не API. В DevTools → Network проверьте, что `/assets/index-*.js` отдаётся с кодом 200, не 404/HTML.

Если при старте `ENOENT ... /app/package.json` — в образе нет `package.json`; залейте актуальный `Dockerfile.static` с `package.runtime.json`.

Если сборка падает с `"/backend": not found` — на Railway всё ещё старый Dockerfile. Залейте актуальный `frontend/` в Git и **Redeploy** с очисткой build cache.

Если в логе `vite: not found` или `npm run build` падает — на build-стадии не установились devDependencies. В `Dockerfile.static` уже стоит `ENV NODE_ENV=development` и `npm ci --include=dev`.

Если `paths[1] ... Received type boolean (true)` — в `dist/serve.json` было `"public": true`. Файл удаляется при сборке; сделайте Redeploy с **Clear build cache**.

**Variables (важно для build):**

| Переменная | Значение |
|------------|----------|
| `VITE_API_URL` | публичный URL **бэкенда**, без `/` в конце, напр. `https://voronka-api.up.railway.app` |

`VITE_*` подставляются **при сборке** Docker. После смены `VITE_API_URL` нужен **Redeploy**.

**Не нужны на фронте:** `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `GOOGLE_SCRIPT_URL`

**Generate Domain** для фронта → скопируйте URL в `FRONTEND_URL` на **бэкенде** → Redeploy бэкенд.

---

## 4. Порядок действий

1. Deploy **backend** + Postgres.
2. Deploy **frontend** с `VITE_API_URL` = URL бэкенда.
3. Домен фронта → в `FRONTEND_URL` на бэкенде.
4. Redeploy оба при смене URL.

---

## 5. Magic link (Resend)

1. [resend.com](https://resend.com) → API Keys → `RESEND_API_KEY`.
2. Domains → добавьте домен → DNS-записи → после верификации укажите `RESEND_FROM_EMAIL` (например `noreply@ваш-домен.ru`).
3. Для быстрого теста Resend даёт `onboarding@resend.dev` — письма уходят **только на email вашего аккаунта Resend**.

Ссылка в письме: `FRONTEND_URL/auth/verify?token=...` → фронт вызывает `VITE_API_URL/api/auth/verify`.

Без `RESEND_*` в **production** отправка вернёт ошибку. Локально без ключей ссылка в консоли и в `devLink` в ответе API.

---

## 6. Что куда (шпаргалка)

### Только BACKEND

- `DATABASE_URL`
- `FRONTEND_URL` — URL сайта (CORS + magic link)
- `JWT_SECRET`, `REFRESH_SECRET`
- `GOOGLE_SCRIPT_URL` (опционально)
- `NODE_ENV=production`

### Только FRONTEND

- `VITE_API_URL` — URL API

### Postgres

- Только `DATABASE_URL` (reference в backend)
