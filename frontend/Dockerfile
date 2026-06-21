# ========== Stage 1: сборка ==========
FROM node:16-alpine AS builder
WORKDIR /app
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========== Stage 2: раздача через nginx ==========
FROM nginx:latest
# Копируем собранные файлы
COPY --from=builder /app/build /usr/share/nginx/html
# Копируем конфиг nginx (он у вас лежит в nginx/conf.d/default.conf)
COPY nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]