# -------------------------------
# 🔹 Base layer
# -------------------------------
FROM node:20-alpine AS base

# Instala dependências do sistema + Chromium para Puppeteer
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    bash \
    curl \
    git \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji

# Configura Puppeteer para usar Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma

# -------------------------------
# 🔹 Development stage
# -------------------------------
FROM base AS development
RUN npm install
COPY . .

# Gera o cliente Prisma (precisa do schema já copiado)
RUN npx prisma generate

EXPOSE 5000
CMD ["npm", "run", "dev"]

# -------------------------------
# 🔹 Build stage
# -------------------------------
FROM base AS build
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# -------------------------------
# 🔹 Production stage
# -------------------------------
FROM node:20-alpine AS production
WORKDIR /app

# Instala dependências do sistema + Chromium para produção também
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configura Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production && npm cache clean --force

COPY --from=build /app/dist ./dist

# Gera o cliente Prisma novamente (para garantir compatibilidade)
RUN npx prisma generate

EXPOSE 5000
CMD ["npm", "start"]