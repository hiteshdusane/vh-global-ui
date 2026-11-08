FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

# Railway service variables are passed as build arguments to Vite.
# When omitted, Vite uses the committed .env.production settings.
ARG VITE_API_URL
ARG VITE_GA_MEASUREMENT_ID
ARG VITE_GA_DEBUG
ARG VITE_APP_SCRIPT_EXCEL_URL
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
ENV PORT=8080
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
