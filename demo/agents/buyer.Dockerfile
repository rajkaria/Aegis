FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/gate/package.json packages/gate/
COPY packages/integrations/package.json packages/integrations/
COPY demo/package.json demo/

RUN npm install --workspace=packages/shared --workspace=packages/gate --workspace=packages/integrations --workspace=demo

COPY packages/shared/ packages/shared/
COPY packages/gate/ packages/gate/
COPY packages/integrations/ packages/integrations/
COPY demo/ demo/

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=packages/gate
RUN npm run build --workspace=packages/integrations

EXPOSE 4003
ENV PORT=4003

CMD ["npx", "--yes", "tsx", "demo/agents/autonomous-buyer.ts"]
