# syntax=docker/dockerfile:1

# CForge — Next.js 14 (standalone output) + Prisma 7.
#
# Stages:
#   deps    — full dependency tree, including the Prisma CLI and tsx used by the
#             one-shot migration/seed service
#   builder — `prisma generate` + `next build`
#   runner  — the slim standalone server (default target, used by `web`)
#   tools   — dependencies + schema + seed, used by `migrate` in compose
#
# `src/env.ts` validates the environment while Next collects page data, and
# `prisma.config.ts` reads its datasource URL, so the build needs *syntactically
# valid* placeholders. They are discarded at runtime: the real values come from
# the container environment, never from the image.

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json .npmrc tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/cforge?schema=public"
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/cforge?schema=public" \
    NEXTAUTH_SECRET="build-only-placeholder-secret-32-chars-min" \
    NEXTAUTH_URL="http://localhost:3000" \
    NODE_ENV="production"
RUN mkdir -p public && npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV="production" \
    PORT="3000" \
    HOSTNAME="0.0.0.0"
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
    CMD wget --quiet --tries=1 --spider "http://127.0.0.1:${PORT}/" || exit 1
CMD ["node", "server.js"]

# Reuses the cached dependency layer, so this costs only the context copy.
FROM deps AS tools
ENV NODE_ENV="production"
COPY prisma ./prisma
COPY src ./src
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npx tsx prisma/seed-run.ts"]
