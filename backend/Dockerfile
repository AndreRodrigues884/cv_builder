# -------------------------------
# 🔹 Base layer
# -------------------------------
FROM node:20-alpine AS base

# Instala dependências do sistema necessárias para Prisma
RUN apk add --no-cache libc6-compat openssl1.1-compat bash curl git

WORKDIR /app
COPY package*.json ./

# -------------------------------
# 🔹 Development stage
# -------------------------------
FROM base AS development
RUN npm install
COPY . .

# Gera o cliente Prisma
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

# Dependências de produção + libs do sistema
RUN apk add --no-cache libc6-compat openssl1.1-compat

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copia build e Prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Gera o cliente Prisma em produção
RUN npx prisma generate

EXPOSE 4000
CMD ["npm", "start"]
