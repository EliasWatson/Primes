FROM node:22-bookworm-slim AS build

WORKDIR /opt/app

# scriptc shells out to clang to assemble and link the native executable.
RUN apt-get update \
    && apt-get install -y --no-install-recommends clang \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npx scriptc build src/index.ts -o ./primes

FROM debian:bookworm-slim

WORKDIR /opt/app

COPY --from=build /opt/app/primes ./primes

ENTRYPOINT [ "./primes" ]
