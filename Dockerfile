# syntax=docker/dockerfile:1

# ---- builder ---------------------------------------------------------------
# node:22 to match this repo's own CI (.github/workflows/ci.yml: "Node 22 to
# match remotesea-api's CI and Docker base image") and remotesea-api's own
# Docker base — not an arbitrary pick.
FROM node:22-alpine AS builder
WORKDIR /app

# Dependencies in their own layer, cached unless package*.json changes —
# this repo uses plain npm (package-lock.json committed; no yarn.lock,
# .yarnrc.yml, or "packageManager" field anywhere), not Yarn.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite needs VITE_API_URL as a real process env var at BUILD time, not
# container runtime: it's inlined into the JS bundle via import.meta.env
# AND interpolates the literal "%VITE_API_URL%" token in index.html's CSP
# connect-src (see vite.config.ts's own explicit guard, which throws the
# build if this is unset). Confirmed live: a real env var here overrides
# any stray .env file's value (verified: a local .env with a different
# VITE_API_URL did not win) — .dockerignore below still excludes .env*
# from the build context anyway, so there's no ambiguity either way.
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# ---- runtime ----------------------------------------------------------------
# nginx:alpine — small, standard static-file server; no Node/dev server in
# the shipped image, only the built dist/ output and nginx itself.
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
