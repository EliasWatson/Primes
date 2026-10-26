# Rust solution by eliaswatson

![Algorithm](https://img.shields.io/badge/Algorithm-base-green)
![Faithfulness](https://img.shields.io/badge/Faithful-yes-green)
![Parallelism](https://img.shields.io/badge/Parallel-no-green)
![Bit count](https://img.shields.io/badge/Bits-8-yellowgreen)

A plain implementation of the base algorithm with one byte per flag, using
only the standard library and no `unsafe` code.

The sieve is a `PrimeSieve` struct that holds the limit and a `Vec<u8>` of
flags for the odd numbers only: flag i stands for 2 * i + 1. A new sieve is
built on every pass.

The clearing loop works in flag indices: it starts at `factor² / 2` and steps
by `factor`, which is a step of `2 * factor` as numbers. Writing it with
`step_by` over a range bounded by the slice length lets the compiler drop the
bounds checks. The primes are counted once, from the last sieve, after the
timed loop.

## Run instructions

### Docker

```bash
docker build -t primes-rust-8 .
docker run --rm primes-rust-8
```

### Locally

With Rust 1.82 or later:

```bash
cargo run --release
```

## Output

Apple silicon (arm64), Docker:

```
eliaswatson;12341;5.000192;1;algorithm=base,faithful=yes,bits=8
```
