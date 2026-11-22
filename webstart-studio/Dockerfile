# Dockerfile: beschrijft hoe de website in een "container" wordt gebouwd en gestart.
# Wordt gebruikt door o.a. Google Cloud Run, Fly.io, Azure Container Apps, AWS App Runner/ECS.

# --- Stap 1: bouwen (TypeScript -> JavaScript) ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY tsconfig*.json ./
COPY src ./src
COPY public ./public
RUN npm run build

# --- Stap 2: kleine productie-image ---
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY src/views ./src/views
COPY data ./data
EXPOSE 3000
CMD ["node", "dist/server.js"]
