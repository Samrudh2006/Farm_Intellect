FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install OpenSSL (required by Prisma)
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including dev dependencies for Prisma generation
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the application
COPY src ./src/

# Prune dev dependencies to keep image small
RUN npm ci --omit=dev

# Production image
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for runtime
RUN apk add --no-cache openssl

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma

# Change ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]
