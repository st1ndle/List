# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

# Copy only package files first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# --- Stage 2: Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose the application port
EXPOSE 8080

# Use non-root user for security
USER node

# Start the application
CMD ["npm", "start"]
