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
100%, so the binary contains no JavaScript engine at all. It is ~370 KB, has no
runtime dependencies, and starts in about 1.6 ms.

## Changes from solution_2

The algorithm, the four storage strategies, and the output format are unchanged.

### Needed to compile at all

Each of these is behaviour-preserving:

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
  are bounds-checked, so the sparse-growth trick throws, and `new Array(n)` is
  rejected outright because it would allocate holes. The allocation happens
  inside the timed pass, like every other variant's.
- **`bitsPerFlag` is `number` (0 meaning "unknown") instead of
  `number | undefined`.** `undefined` has no static representation in scriptc.
  The output is identical: as in solution_2, the `bits` tag is omitted for the
  `number-array` variant.
- **The `global.gc()` calls between runs are gone.** They required Node's
  `--expose-gc`, and there is no Node here.

### Tuned for scriptc's code generator

The straight port ran at 245/220/549/1174 passes. Reading the emitted IR
(`scriptc build` leaves an `index.ll` beside the binary) showed where the time
was going, and four source-level changes roughly doubled the bit-packed
variants. Measured effect of each, in order:

| change | effect |
| --- | --- |
| `i % 32` → `i & 31`, `i % 8` → `i & 7` | `%` on numbers lowers to a libm `fmod` call — 10.6 ns/op against 1.95 for a mask. Biggest single win. |
| Hoist `this.bits` / `this.sieveSize` into locals in `runSieve` and `countPrimes` | Every field read was bracketed by a reference-count retain/release pair, once per loop-condition check. |
| `class PrimeSieve<T extends IBitArray>` | scriptc monomorphizes generics, so this emits four specialized copies of the sieve. Every `bits.get`/`bits.setTrue` becomes a direct call and then gets inlined — the IR goes from vtable dispatch to zero indirect calls. |
| Drop the redundant `& 31` in `Bit32Array` | JS shift counts are taken modulo 32, so `1 << i` already selects bit `i % 32`. Worth ~19% here because *every* bitwise operator is a real call. (`Bit8Array` still needs its `& 7` — shifts mask to 32, not 8.) |

The reason such small edits matter so much: scriptc's runtime helpers
(`scr_bit_and`, `scr_bit_shl`, `scr_bytes_get`, …) live in a separately compiled
archive and the build does not use LTO, so each bitwise operation and each typed
array access is an un-inlinable function call. Removing one operation from the
inner loop removes ~2.5 M calls per pass. All arithmetic is IEEE double
throughout; there is no integer tier to opt into. The program itself is already
compiled at `-O2`, so there was no optimization flag left to turn on.

A mask lookup table instead of `1 << ixBit` was also tried and is a wash — it
trades one runtime call for another — so it is not used.

Note that these changes are aimed at scriptc specifically and are *not*
universally faster; see the table below, where several of them are a net loss
under V8.

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
Passes: 464, Time: 5, Avg: 0.010775862068965518, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_32bit-array;464;5;1;algorithm=base,faithful=yes,bits=1
Passes: 428, Time: 5, Avg: 0.011682242990654205, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_8bit-array;428;5;1;algorithm=base,faithful=yes,bits=1
Passes: 641, Time: 5, Avg: 0.0078003120124804995, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_number-array;641;5;1;algorithm=base,faithful=yes
Passes: 1572, Time: 5.001, Avg: 0.003181297709923664, Limit: 1000000, Count: 78498, Valid: true
mikevdbokke-scriptc_byte-array;1572;5.001;1;algorithm=base,faithful=yes,bits=8
```

### Comparison

Same machine, passes in 5 seconds. The middle column is this solution's source
compiled by `tsc` and run on Node 24, which separates "what the compiler costs"
from "what the source changes did".

| variant        | this / scriptc | this / node | solution_2 / node |
| -------------- | -------------: | ----------: | ----------------: |
| `32bit-array`  |            464 |        9012 |              6916 |
| `8bit-array`   |            428 |        7832 |              9689 |
| `number-array` |            641 |         853 |              1075 |
| `byte-array`   |           1572 |        5337 |             11319 |

Two things worth reading off this:

- The native binary is still well behind V8 on this workload — between 1.3× and
  18× depending on variant. V8's JIT specializes these loops to integer
  registers; scriptc emits calls into a generic double-based runtime.
- The scriptc-targeted source changes are not free elsewhere. They help the
  32-bit variant on V8 too (6916 → 9012), but cost the byte-array variant a lot
  (11319 → 5337), most likely because giving the four storage classes a common
  base class disturbs V8's inline caches. This is a solution tuned for one
  compiler.

What the binary does buy is startup and footprint: measured over 100 runs of a
`console.log` one-liner on this machine, the scriptc binary starts in 1.6 ms
against node's 19.2 ms, and the sieve executable is a ~370 KB file with no
runtime dependencies.

## Author

- Original SOLUTION_2
Michael van der Bokke
http://vanderbokke.net/Michael/

- scriptc port
Elias Watson
