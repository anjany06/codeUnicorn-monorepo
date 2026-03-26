# Stage 1: Base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable


# Stage 2: Prune workspace for the API
FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install turbo globally
RUN pnpm i -g turbo@^2.3.0
COPY . .
# Prune the workspace to only include the api app and its dependencies
RUN turbo prune @codeunicorn/api --docker

# Stage 3: Install and Build
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# Now copy the source code of the pruned workspace
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Build the project and its dependencies
RUN pnpm turbo build --filter=@codeunicorn/api...

# Stage 4: Runner
FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs
USER expressjs

# Copy the entire pruned and built monorepo
# (Turbo prune ensures we only have code for the api and its packages)
COPY --from=installer --chown=expressjs:nodejs /app .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]
