# Multi-stage Dockerfile for SATYA Debt Dashboard
# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./
RUN npm install

# Copy source and build the distribution
COPY . .
RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
