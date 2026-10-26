# Goose solution by eliaswatson

![Algorithm](https://img.shields.io/badge/Algorithm-base-green)
![Faithfulness](https://img.shields.io/badge/Faithful-yes-green)
![Parallelism](https://img.shields.io/badge/Parallel-no-green)
![Bit count](https://img.shields.io/badge/Bits-8-yellowgreen)

A straightforward, idiomatic implementation of the base algorithm in
[Goose](https://aardappel.github.io/goose/), a memory-safe systems language
that compiles to C and has no heap: every dynamic value lives on a data stack
and is freed when its owning scope ends.

The sieve is a `PrimeSieve` struct that holds the sieve limit and the prime
flags. The flags are a grow-only `bool[>..]` array, sized at runtime with
`resize`, that is the struct's last field, so each sieve is one contiguous
block. A new sieve is created on every pass, and its memory is released at
the end of the loop body. Only odd numbers are stored. Goose defines `bool`
as one byte, so each flag takes 8 bits.

## Run instructions

### Docker

```bash
docker build -t primes-goose .
docker run --rm primes-goose
```

### Locally

Install a [Goose release](https://github.com/aardappel/goose/releases)
(v2026.3 was used) and a C compiler, then:

```bash
goose build primes.goose
./primes
```

## Output

```
eliaswatson;9176;5.000316;1;algorithm=base,faithful=yes,bits=8
```
