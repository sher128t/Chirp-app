# Development stage
FROM node:20-alpine AS development

# Install OpenSSL and other dependencies required by Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (this will compile native modules for Linux)
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Default command for development
CMD ["npm", "run", "start:dev"]

# ============================================
# Production build stage
# ============================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl openssl-dev libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build

# ============================================
# Production stage
# ============================================
FROM node:20-alpine AS production

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy Prisma files and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
