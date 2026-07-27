# TypeScript solution by mikevdbokke, compiled natively with scriptc

![Algorithm](https://img.shields.io/badge/Algorithm-base-green)
![Faithfulness](https://img.shields.io/badge/Faithful-yes-green)
![Parallelism](https://img.shields.io/badge/Parallel-no-green)
![Bit count](https://img.shields.io/badge/Bits-1-green)
![Bit count](https://img.shields.io/badge/Bits-8-yellowgreen)
![Bit count](https://img.shields.io/badge/Bits-unknown-yellowgreen)

This is [solution_2](../solution_2) (Michael van der Bokke's four flag-storage
variants: `Uint32Array`, `Uint8Array` bit-packed, plain `number[]`, and
`Uint8Array` byte-per-flag) compiled ahead-of-time to a self-contained native
executable with [scriptc](https://github.com/vercel-labs/scriptc) instead of
being run on Node.js/V8.

The whole program compiles in scriptc's static tier — `scriptc coverage` reports
100%, so the binary contains no JavaScript engine at all. It is ~367 KB and has
no runtime dependencies.

## Changes from solution_2

The algorithm, the four storage strategies, and the output are unchanged. The
following adjustments were needed to fit scriptc's supported surface, and each
one is behaviour-preserving:

- **`IBitArray` is an abstract base class instead of an interface.** scriptc
  lowers an interface to a structural record shape, so a single
  interface-typed slot cannot hold four different classes. An abstract class
  gives the nominal dynamic dispatch solution_2 was relying on anyway.
- **`Math.sqrt` replaced with `factor * factor <= sieveSize`.** scriptc has no
  static lowering for `Math.sqrt`. For integers the two conditions are exactly
  equivalent.
- **Compound assignment `bits[i] |= x` written out as `bits[i] = bits[i] | x`.**
  scriptc has no lowering for compound array-element assignment.
- **`BitNumArray` pre-sizes its `number[]`** with a `push` loop rather than
  starting from `[]` and letting out-of-bounds writes grow it. scriptc arrays
  are bounds-checked, so the sparse-growth trick throws. The allocation happens
  inside the timed pass, like every other variant's.
- **`bitsPerFlag` is `number` (0 meaning "unknown") instead of
  `number | undefined`.** `undefined` has no static representation in scriptc.
  The output is identical: as in solution_2, the `bits` tag is omitted for the
  `number-array` variant.
- **The `global.gc()` calls between runs are gone.** They required Node's
  `--expose-gc`, and there is no Node here.

The sources still typecheck cleanly under `tsc --strict` (`npm run typecheck`).

## Run instructions

You need Node.js (to install the compiler from npm) and clang (Xcode Command
Line Tools on macOS). scriptc's primary platform is macOS arm64.

```bash
npm install
npm run build     # scriptc build src/index.ts -o ./primes
npm start         # ./primes
```

Or compile and run in one step, without producing a binary:

```bash
npm run dev       # scriptc run src/index.ts
```

To see how much of the program compiles statically:

```bash
npm run coverage
```

### Docker

```bash
docker build -t primes .
docker run --rm primes
```

> **Note:** the `Dockerfile` is provided but has not been verified — the results
> below were produced by running the native binary directly on macOS. scriptc
> lists Linux as a cross-compilation target rather than a primary platform, so
> the Linux build may need adjustment.

## Output

Running on an Apple Silicon Mac (macOS 26.3, arm64), `./primes`:

```log
Passes: 248, Time: 5.006, Avg: 0.020185483870967743, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_32bit-array;248;5.006;1;algorithm=base,faithful=yes,bits=1
Passes: 222, Time: 5.012, Avg: 0.022576576576576576, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_8bit-array;222;5.012;1;algorithm=base,faithful=yes,bits=1
Passes: 555, Time: 5.008, Avg: 0.009023423423423424, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_number-array;555;5.008;1;algorithm=base,faithful=yes
Passes: 1180, Time: 5, Avg: 0.00423728813559322, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_byte-array;1180;5;1;algorithm=base,faithful=yes,bits=8
```

### Comparison with solution_2 on Node.js

Same machine, same run, solution_2 under `node --expose-gc` (Node 24):

| variant        | scriptc (native) | node/V8 |
| -------------- | ---------------: | ------: |
| `32bit-array`  |              248 |    6916 |
| `8bit-array`   |              222 |    9689 |
| `number-array` |              555 |    1075 |
| `byte-array`   |             1180 |   11319 |

The native binary is currently well behind V8 on this workload. Reading the
emitted IR (`scriptc build` leaves an `index.ll` beside the binary by default),
the reasons are in
the code generator rather than in this solution: every field access is bracketed
by a reference-count retain/release pair, `bits.get(...)`/`bits.setTrue(...)`
stay as indirect vtable calls with no devirtualization, and all numbers are
IEEE doubles. The program TU is already compiled at `-O2`, so there is no
optimization flag left to turn on. What the binary does buy is startup time and
footprint: measured over 100 runs of a `console.log` one-liner on this machine,
the scriptc binary starts in 1.6 ms against node's 19.2 ms, and the sieve
executable is a 367 KB file with no runtime dependencies.

## Author

- Original SOLUTION_2
Michael van der Bokke
http://vanderbokke.net/Michael/

- scriptc port
Elias Watson
