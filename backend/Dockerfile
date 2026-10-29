# ZEROTrace AI Backend — Production Container
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL for Prisma engine on Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src/

RUN npm run build

# Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=5000

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma/
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

# Create runtime storage directory
RUN mkdir -p ./data

EXPOSE 5000

# When DATABASE_URL is provided, apply pending database migrations automatically before server boot
CMD ["sh", "-c", "if [ -n \"$DATABASE_URL\" ]; then npx prisma migrate deploy; fi && node dist/server.js"]
