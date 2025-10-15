# -------------------------------
# 🔹 Base layer
# -------------------------------
FROM node:20-bullseye AS base
WORKDIR /app
ENV PRISMA_CLI_QUERY_ENGINE_TYPE=binary
COPY package*.json ./

# -------------------------------
# 🔹 Development stage
# -------------------------------
FROM base AS development
RUN npm install
COPY . .

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
FROM node:20-bullseye AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 4000
CMD ["npm", "start"]
