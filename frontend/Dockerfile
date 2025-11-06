# -------------------------------
# 🔹 Base
# -------------------------------
FROM node:20-bullseye AS base
WORKDIR /app/frontend
COPY package*.json ./

# -------------------------------
# 🔹 Development
# -------------------------------
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
