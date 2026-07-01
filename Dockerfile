# Сборка фронта из корня репо (Root Directory = "."). Лучше: Root Directory = frontend
FROM node:20-alpine AS build
WORKDIR /app

ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --include=dev || npm install --include=dev

COPY frontend/ ./
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build \
  && rm -f dist/serve.json public/serve.json \
  && test -f dist/index.html \
  && ls dist/assets/

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY frontend/package.runtime.json package.json
RUN npm install --omit=dev \
  && test -x node_modules/.bin/serve

EXPOSE 3000
CMD ["sh", "-c", "rm -f dist/serve.json && exec npm start"]
