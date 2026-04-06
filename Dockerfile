# syntax=docker/dockerfile:1

## Build the production assets with Vite
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first to leverage Docker layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source and create the production build
COPY . .
RUN npm run build

## Serve the compiled assets via a lightweight Node-based static server
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist

EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
