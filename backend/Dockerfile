# Multi-stage Dockerfile for production deployment
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Copy root tsconfig (required by shared/ and backend/ which extend it)
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci --workspace=backend --workspace=shared

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Remove any stale .tsbuildinfo files from local machine to force a clean build
# (composite: true uses these to skip recompilation, which can prevent .d.ts from being emitted)
RUN rm -f ./shared/tsconfig.tsbuildinfo ./backend/tsconfig.tsbuildinfo

# Build shared package
RUN npm run build --workspace=shared

# Build backend
RUN npm run build --workspace=backend

# Stage 2: Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files for production dependencies only
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN npm ci --workspace=backend --workspace=shared --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/shared/dist ./shared/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run injects PORT=8080)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production
ENV PORT=8080

# Start the application
CMD ["node", "backend/dist/index.js"]
