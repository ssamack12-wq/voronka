# Деплой на Railway

Проект — **один сервис**: фронт (Vite build → `dist/`) + API (Express) + PostgreSQL.

Отдельного фронт-сервиса нет: всё отдаёт `node server.js` на одном домене.

---

## 1. Создать проект

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.
2. Выберите репозиторий `voronka-main` (или ваш fork).

Railway соберёт образ по `Dockerfile` и `railway.json` (healthcheck: `/health`).

---

## 2. PostgreSQL

1. В проекте: **+ New** → **Database** → **PostgreSQL**.
2. Дождитесь статуса **Active**.

Схема таблиц применяется **автоматически** при старте приложения (`backend/db/schema.sql`).

---

## 3. Переменные окружения

### Куда писать

**Только в сервис приложения** (web), не в сервис Postgres:

`Project → ваш Web-сервис → Variables`

Postgres уже имеет свой `DATABASE_URL` — его нужно **подключить** к приложению (шаг 4).

### Обязательные (Web-сервис)

| Переменная | Значение | Зачем |
|------------|----------|--------|
| `NODE_ENV` | `production` | production-режим, secure cookies |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | см. шаг 4 — ссылка на БД |
| `FRONTEND_URL` | `https://ваш-домен.up.railway.app` | Magic link + CORS (ваш публичный URL) |
| `JWT_SECRET` | случайная строка 32+ символов | подпись access cookie |
| `REFRESH_SECRET` | другая случайная строка | подпись refresh cookie |

Сгенерировать секреты (локально):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Опциональные

| Переменная | Значение |
|------------|----------|
| `GOOGLE_SCRIPT_URL` | URL Google Apps Script — только для лида из **квиза** (`/api/lead`) |
| `VITE_API_URL` | **Не задавать** на Railway (API и фронт на одном домене) |
| `PORT` | Railway подставит сам — **не переопределяйте** без нужды |
| `RESEND_API_KEY` | зарезервировано, письма magic link пока в логах |

### Что НЕ нужно на Railway

- `DATA_DIR` — использовался для файлового store; в production только Postgres.
- Отдельный фронт-деплой / `npm run dev` — не используется.

---

## 4. Подключить Postgres к приложению

**Способ A (рекомендуется):**

1. Откройте **Web-сервис** → **Variables** → **Add Variable Reference** (или **Connect**).
2. Выберите сервис **Postgres** → переменная **`DATABASE_URL`**.
3. Имя в приложении: `DATABASE_URL` (значение вида `${{Postgres.DATABASE_URL}}`).

**Способ B:**

Скопируйте `DATABASE_URL` из Postgres → Variables и вставьте в Web-сервис вручную.

---

## 5. Публичный домен

1. Web-сервис → **Settings** → **Networking** → **Generate Domain**.
2. Скопируйте URL, например `https://voronka-production.up.railway.app`.
3. В Variables задайте **`FRONTEND_URL`** = этот URL **без слэша в конце**.

После смены домена обновите `FRONTEND_URL` и сделайте **Redeploy**.

---

## 6. Команды запуска (что делает Railway)

| Этап | Команда | Где |
|------|---------|-----|
| Сборка | `docker build` по `Dockerfile` → `npm ci` + `npm run build` | Build |
| Старт | `node server.js` (`package.json` → `"start"`) | Deploy |
| Миграции | автоматически в `server.js` при старте | Runtime |

**Start Command** в Railway можно оставить пустым (из Dockerfile `CMD`) или явно:

```bash
node server.js
```

**Build Command** не нужен — всё в Dockerfile.

---

## 7. Проверка после деплоя

1. `https://ВАШ-ДОМЕН/health` → `{ "ok": true, "storage": "postgres", "db": "connected" }`
2. Откройте `/` — лендинг.
3. `/quiz` — квиз без входа.
4. «Хочу провести сделку» → email → в **Deploy Logs** найдите `[magic-link] ...` и откройте ссылку (пока без Resend).

---

## 8. Локальная разработка

### С Postgres (как на Railway)

```bash
# 1. Postgres локально (пример)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voronka

# 2. .env в корне (скопируйте из .env.example)
cp .env.example .env

# 3. API
npm run dev:server

# 4. Фронт (в другом терминале)
npm run dev
```

Миграции вручную:

```bash
set DATABASE_URL=postgresql://...
npm run db:migrate
```

### Без Postgres (файл `backend/data/store.json`)

Не задавайте `DATABASE_URL` — только для dev.

---

## 9. Структура: фронт vs бэкенд

| Часть | Папка / артефакт | Переменные |
|-------|------------------|------------|
| Фронт (React) | `src/` → build `dist/` | `VITE_*` только **на этапе build** |
| API | `server.js`, `backend/` | `DATABASE_URL`, `JWT_*`, `FRONTEND_URL` |
| БД | Railway PostgreSQL | `DATABASE_URL` на API-сервисе |

На Railway фронт **встроен** в тот же контейнер: запросы `/api/*` → Express, остальное → `dist/index.html`.

---

## 10. Типичные ошибки

| Симптом | Решение |
|---------|---------|
| `FATAL: DATABASE_URL is required` | Подключите Postgres reference к Web-сервису |
| `/health` → `db: error` | Проверьте `DATABASE_URL`, redeploy после линка БД |
| Magic link ведёт на localhost | Исправьте `FRONTEND_URL` на Railway-домен |
| Квиз-лид не работает | Задайте `GOOGLE_SCRIPT_URL` или игнорируйте |
| 401 после входа | `JWT_SECRET` не меняйте после выдачи токенов без logout |

---

## 11. Дальше

- **Resend** + `RESEND_API_KEY` — отправка magic link на email.
- **Custom domain** — Railway Networking → Custom Domain → обновить `FRONTEND_URL`.
