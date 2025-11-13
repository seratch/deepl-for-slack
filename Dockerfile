FROM denoland/deno:latest
WORKDIR /app

COPY . .
RUN deno cache server.ts || true

EXPOSE 10000
CMD deno run --allow-net --allow-env server.ts
