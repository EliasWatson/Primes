FROM rust:1.82-slim-bookworm AS build

WORKDIR /app
COPY Cargo.toml .
COPY src src
RUN cargo build --release

FROM debian:bookworm-slim

COPY --from=build /app/target/release/prime-sieve /usr/local/bin/prime-sieve

ENTRYPOINT [ "prime-sieve" ]
