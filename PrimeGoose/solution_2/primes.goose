// The sieve of Eratosthenes, as described in the drag-race base algorithm,
// tuned for speed while keeping one byte per flag and a single thread.
// The sieve only stores the odd numbers: flag i stands for 2 * i + 1.

import std;
import os;

let LIMIT = 1000000;

// The full state of one sieve. The flags are its growable tail field, so a
// sieve is one block on a data stack.
struct PrimeSieve { limit: i64, bits: bool[>..] }

fn new_sieve(limit: i64) -> PrimeSieve {
    var sieve = PrimeSieve { limit: limit, bits: [] };
    sieve.bits.resize((limit + 1) / 2, true);
    return sieve;
}

fn run_sieve(sieve: PrimeSieve&) {
    let bits = sieve.bits[..];
    var factor = 3;
    while factor * factor <= sieve.limit {
        // Both conditions hold whenever the loop runs; stating them lets the
        // compiler drop the bounds check on bits[index].
        let index = factor / 2;
        assert(index >= 0);
        if index < bits.len && bits[index] {
            // Working in flag indices, the multiples of factor from factor²
            // are factor flags apart, which is 2 * factor apart as numbers.
            // The loop clears four of them per round, then the remainder.
            var i = factor * factor / 2;
            let step = factor * 4;
            while i + factor * 3 < bits.len {
                bits[i] = false;
                bits[i + factor] = false;
                bits[i + factor * 2] = false;
                bits[i + factor * 3] = false;
                i += step;
            }
            while i < bits.len {
                bits[i] = false;
                i += factor;
            }
        }
        factor += 2;
    }
}

fn count_primes(sieve: PrimeSieve&) -> i64 {
    // 2 is not in the sieve, and 1 (flag 0) is not a prime.
    var count = if sieve.limit >= 2 { 1 } else { 0 };
    for flag, i in sieve.bits {
        if flag && i > 0 { count++; }
    }
    return count;
}

fn expected_count(limit: i64) -> i64 {
    match limit {
        10 => 4,
        100 => 25,
        1000 => 168,
        10000 => 1229,
        100000 => 9592,
        1000000 => 78498,
        10000000 => 664579,
        100000000 => 5761455,
        _ => -1,
    }
}

fn main() {
    let start = clock();
    var passes = 1;
    var sieve = new_sieve(LIMIT);
    run_sieve(sieve);
    // Every pass builds a new sieve in the place of the last one; the last
    // one is kept for the count.
    while clock() - start < 5.0 {
        sieve = new_sieve(LIMIT);
        run_sieve(sieve);
        passes++;
    }
    let duration = clock() - start;

    let count = count_primes(sieve);
    let valid = count == expected_count(LIMIT);
    write_stderr(str("Passes: ", passes, ", Time: ", duration, ", Limit: ", LIMIT,
                     ", Count: ", count, ", Valid: ", valid, "\n"));

    var line: u8[>..] = [];
    format(line, "eliaswatson_unrolled;", passes, ";");
    format_flt(line, duration, 6);
    format(line, ";1;algorithm=base,faithful=yes,bits=8");
    print(line);
}
