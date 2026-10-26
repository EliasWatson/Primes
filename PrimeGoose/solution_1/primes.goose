// The sieve of Eratosthenes, as described in the drag-race base algorithm.
// The sieve only stores the odd numbers: flag i stands for 2 * i + 1.

import std;
import os;

let LIMIT = 1000000;

// The full state of one sieve. The flags are its growable tail field, so a
// sieve is one block on a data stack, freed when the variable holding it
// goes out of scope.
struct PrimeSieve { limit: i64, bits: bool[>..] }

fn new_sieve(limit: i64) -> PrimeSieve {
    var sieve = PrimeSieve { limit: limit, bits: [] };
    sieve.bits.resize((limit + 1) / 2, true);
    return sieve;
}

fn run_sieve(sieve: PrimeSieve&) {
    var factor = 3;
    while factor * factor <= sieve.limit {
        if sieve.bits[factor / 2] {
            var multiple = factor * factor;
            while multiple <= sieve.limit {
                sieve.bits[multiple / 2] = false;
                multiple += factor * 2;
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
    var passes = 0;
    var count = 0;
    while clock() - start < 5.0 {
        var sieve = new_sieve(LIMIT);
        run_sieve(sieve);
        count = count_primes(sieve);
        passes++;
    }
    let duration = clock() - start;

    let valid = count == expected_count(LIMIT);
    write_stderr(str("Passes: ", passes, ", Time: ", duration, ", Limit: ", LIMIT,
                     ", Count: ", count, ", Valid: ", valid, "\n"));

    var line: u8[>..] = [];
    format(line, "eliaswatson;", passes, ";");
    format_flt(line, duration, 6);
    format(line, ";1;algorithm=base,faithful=yes,bits=8");
    print(line);
}
