# Goose solution by eliaswatson

![Algorithm](https://img.shields.io/badge/Algorithm-base-green)
![Faithfulness](https://img.shields.io/badge/Faithful-yes-green)
![Parallelism](https://img.shields.io/badge/Parallel-no-green)
![Bit count](https://img.shields.io/badge/Bits-8-yellowgreen)

A speed-tuned version of [solution_1](../solution_1), written in
[Goose](https://aardappel.github.io/goose/). It stays within the base
algorithm, uses one byte per flag, and runs on a single thread.

The structure is the same as solution_1: a `PrimeSieve` struct holds the
limit and a `bool[>..]` array of flags for the odd numbers, and every pass
builds a new sieve. The differences are:

- The clearing loop works in flag indices. It starts at `factor² / 2` and
  steps by `factor`, which is a step of `2 * factor` as numbers, so no
  division happens per flag.
- The clearing loop is unrolled to clear four multiples per round, followed
  by a loop for the remainder.
- The `while` bounds and an `assert` let the compiler drop the bounds check
  on the factor lookup. The check in the clearing loop stays: Goose's
  bounds-check analysis cannot prove a step by a variable keeps the index
  non-negative. Removing it by hand from the generated C made no measurable
  difference, as the loop is limited by stores to memory.
- The primes are counted once, from the last sieve, after the timed loop.

Unrolling by eight was no faster than by four, and the generated C runs the
same with gcc or clang at `-O2` or `-O3`, with or without `-mcpu=native`, so
the solution uses a plain `goose build`.

## Run instructions

### Docker

```bash
docker build -t primes-goose-2 .
docker run --rm primes-goose-2
```

### Locally

Install a [Goose release](https://github.com/aardappel/goose/releases)
(v2026.3 was used) and a C compiler, then:

```bash
goose build primes.goose
./primes
```

## Output

Apple silicon (arm64), Docker:

```
eliaswatson_unrolled;12633;5.000145;1;algorithm=base,faithful=yes,bits=8
```
