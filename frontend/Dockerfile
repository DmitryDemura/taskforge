# ---- build ----
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
COPY --from=build /app/.output ./.output
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]
