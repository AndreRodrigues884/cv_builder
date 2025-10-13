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
EXPOSE 3000
CMD ["npm", "run", "dev"]

# -------------------------------
# 🔹 Production build stage
# -------------------------------
FROM base AS production-build
# ⚠️ Use `npm ci` sem `--only=production` aqui,
# pois o build precisa das dependências de dev.
RUN npm ci
COPY . .
RUN npm run build