# ========== Stage 1: сборка ==========
FROM node:16-alpine AS builder

WORKDIR /app

# bcrypt — нативный модуль, на Alpine нужны инструменты сборки
RUN apk add --no-cache python3 make g++

# Кэширование: сначала только lock-файлы
COPY package*.json ./

RUN npm ci

# Теперь исходники
COPY . .

RUN npm run build


# ========== Stage 2: production ==========
FROM node:16-alpine AS production

WORKDIR /app

RUN apk add --no-cache python3 make g++ \
  && npm install -g pm2

COPY package*.json ./

RUN npm ci --omit=dev

# Только скомпилированный код — без src/, tsconfig и т.д.
COPY --from=builder /app/dist ./dist

COPY ecosystem.config.js ./

EXPOSE 4000

CMD ["pm2-runtime", "ecosystem.config.js"]