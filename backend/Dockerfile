# ---- Estágio 1: build (TypeScript → JavaScript) ----
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Estágio 2: produção (só o necessário para rodar) ----
FROM node:24-alpine AS producao
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=build /app/dist ./dist

# Boa prática de segurança: não rodar como root dentro do container
USER node

EXPOSE 3000
CMD ["node", "dist/main.js"]
