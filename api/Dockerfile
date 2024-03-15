FROM node:18-alpine as base

FROM base as builder

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci

COPY ./src src
COPY ./resource resource
COPY ./prisma prisma
COPY ./generate generate
COPY tsconfig.json \
    tsconfig.prod.json \
    ./
RUN npm run generate-models
RUN npm run build

FROM base as runner

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci --omit dev

COPY --from=builder /app/node_modules/.prisma/client node_modules/.prisma/client
COPY --from=builder /app/build ./build

CMD ["node", "build/src/main.js"]
