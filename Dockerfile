# Use Node.js 20 LTS Alpine for smaller image size
FROM node:20-alpine

# Install system dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY db/ ./db/
COPY server/ ./server/
COPY client/ ./client/
COPY *.ts ./
COPY *.js ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Build the application
RUN npm run build

# Expose the port that Cloud Run expects
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]