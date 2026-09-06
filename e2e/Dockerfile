# e2e/Dockerfile
# Tag MUST match the exact @playwright/test version in package.json:
#   grep '"@playwright/test"' package.json
ARG PW_VERSION=1.63.0
FROM mcr.microsoft.com/playwright:v${PW_VERSION}-noble

WORKDIR /work
ENV CI=1

# packageManager in package.json; corepack is on its way out of Node.
RUN npm install -g pnpm@11.1.2

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

# Everything after the image name goes straight to the Playwright CLI:
#   docker compose -f e2e/docker-compose.yml run --rm tests --grep "check-in" --project mobile
ENTRYPOINT ["pnpm", "exec", "playwright", "test", "--config", "e2e/playwright.config.ts"]
CMD []
