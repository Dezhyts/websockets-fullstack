FROM node:24.11.1-alpine as builder

WORKDIR /app

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci

COPY backend/ .

RUN npx prisma generate
RUN npm run build

RUN npm prune --production

FROM node:24.11.1-alpine as runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000


CMD ["node", "dist/src/main.js"]