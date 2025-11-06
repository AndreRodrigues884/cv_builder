# -------------------------------
# 🔹 Base layer (Node.js + system deps)
# -------------------------------
FROM node:20-slim AS base

# Atualiza pacotes e instala dependências do sistema
RUN apt-get update && apt-get install -y \
    libc6 \
    libvips-dev \
    libfftw3-dev \
    libssl-dev \
    git \
    curl \
    bash \
    chromium \
    ca-certificates \
    fonts-freefont-ttf \
    fonts-noto-color-emoji \
    python3 \
    build-essential \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Configura Puppeteer para usar Chromium do sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copia APENAS package*.json primeiro
COPY package*.json ./

# -------------------------------
# 🔹 Development stage
# -------------------------------
FROM base AS development

# IMPORTANTE: Instala dependências DENTRO do container
# Isso garante que o Sharp seja compilado para Linux
RUN npm install --include=optional

# DEPOIS copia o resto do código
COPY . .
COPY prisma ./prisma

# Rebuild do Sharp para garantir compatibilidade
RUN npm rebuild sharp

# Gera cliente Prisma
RUN npx prisma generate

EXPOSE 5000
CMD ["npm", "run", "dev"]

# -------------------------------
# 🔹 Build stage
# -------------------------------
FROM base AS build

RUN npm ci --include=optional
COPY . .
COPY prisma ./prisma

# Rebuild do Sharp
RUN npm rebuild sharp

RUN npx prisma generate
RUN npm run build

# -------------------------------
# 🔹 Production stage
# -------------------------------
FROM node:20-slim AS production

# Instala apenas runtime dependencies
RUN apt-get update && apt-get install -y \
    libvips \
    chromium \
    ca-certificates \
    fonts-freefont-ttf \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copia pacotes
COPY package*.json ./

# Instala dependências de produção
RUN npm ci --omit=dev --include=optional && \
    npm rebuild sharp && \
    npm cache clean --force

# Copia código e prisma
COPY --from=build /app/dist ./dist
COPY prisma ./prisma

# Gera cliente Prisma
RUN npx prisma generate

EXPOSE 5000
CMD ["npm", "start"]