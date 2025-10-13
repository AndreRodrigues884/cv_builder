# -------------------------------
# 🔹 Base layer
# -------------------------------
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# -------------------------------
# 🔹 Development stage
# -------------------------------
FROM base AS development
RUN npm install
COPY . .
# ✅ Garante que o Prisma seja gerado dentro do container
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "run", "dev"]

# -------------------------------
# 🔹 Build stage
# -------------------------------
FROM base AS build
RUN npm ci
COPY . .
# ✅ Gera o cliente Prisma antes do build
RUN npx prisma generate
RUN npm run build

# -------------------------------
# 🔹 Production stage
# -------------------------------
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
# ✅ Copia o código compilado e a pasta prisma (para migrations e schema)
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# ✅ Gera o cliente Prisma em produção também (caso o build não tenha persistido)
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]
