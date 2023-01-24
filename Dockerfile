FROM node:18-alpine3.16 as builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine3.16
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/ ./
ENTRYPOINT [ "node", "./lib/index.js" ]
EXPOSE 3000