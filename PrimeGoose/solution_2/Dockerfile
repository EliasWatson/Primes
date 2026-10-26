FROM ubuntu:24.04 AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates cmake g++ gcc git libc6-dev make \
    && rm -rf /var/lib/apt/lists/*

ARG GOOSE_VERSION=v2026.3
RUN git clone --depth 1 --branch "${GOOSE_VERSION}" https://github.com/aardappel/goose /opt/goose \
    && cmake -S /opt/goose -B /opt/goose/build -DCMAKE_BUILD_TYPE=Release \
    && cmake --build /opt/goose/build --config Release -j "$(nproc)"

WORKDIR /opt/app
COPY primes.goose .
RUN /opt/goose/build/goose build primes.goose

FROM ubuntu:24.04

COPY --from=build /opt/app/primes /usr/local/bin/primes

ENTRYPOINT [ "primes" ]
