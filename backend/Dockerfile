# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=backend --workspace=shared

# Copy source code
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared package
RUN npm run build --workspace=shared

# Build backend
RUN npm run build --workspace=backend

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["node", "backend/dist/index.js"]

# Made with Bob
