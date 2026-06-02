# --- Stage 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# --- Stage 2: Serve ---
FROM nginxinc/nginx-unprivileged:stable-alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx files
USER root
RUN rm -rf ./*
USER 101

# Copy built files from build stage and assign ownership to unprivileged user (101)
COPY --chown=101:101 --from=build /app/dist .

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
