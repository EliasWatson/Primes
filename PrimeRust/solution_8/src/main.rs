//! The sieve of Eratosthenes, base algorithm, one byte per flag, single
//! threaded.

use std::time::{Duration, Instant};

const LIMIT: usize = 1_000_000;

/// The full state of one sieve. The flags are for the odd numbers only:
/// flag i stands for 2 * i + 1. 1 means prime.
struct PrimeSieve {
    limit: usize,
    bits: Vec<u8>,
}

impl PrimeSieve {
    fn new(limit: usize) -> Self {
        PrimeSieve { limit, bits: vec![1u8; (limit + 1) / 2] }
    }

    fn run(&mut self) {
        let bits = &mut self.bits[..];
        let mut factor = 3;
        while factor * factor <= self.limit {
            if bits[factor / 2] == 1 {
                // In flag indices the multiples of factor from factor² are
                // factor flags apart, which is 2 * factor apart as numbers.
                for i in (factor * factor / 2..bits.len()).step_by(factor) {
                    bits[i] = 0;
                }
            }
            factor += 2;
        }
    }

    fn count_primes(&self) -> usize {
        // 2 is not in the sieve, and 1 (flag 0) is not a prime.
        let odd = self.bits.iter().skip(1).filter(|&&flag| flag == 1).count();
        usize::from(self.limit >= 2) + odd
    }
}

fn expected_count(limit: usize) -> Option<usize> {
    match limit {
        10 => Some(4),
        100 => Some(25),
        1_000 => Some(168),
        10_000 => Some(1_229),
        100_000 => Some(9_592),
        1_000_000 => Some(78_498),
        10_000_000 => Some(664_579),
        100_000_000 => Some(5_761_455),
        _ => None,
    }
}

fn main() {
    let start = Instant::now();
    let mut passes = 0;
    let count = loop {
        // Every pass builds a new sieve and runs it; the last one is kept for
        // the count.
        let mut sieve = PrimeSieve::new(LIMIT);
        sieve.run();
        passes += 1;
        if start.elapsed() >= Duration::from_secs(5) {
            break sieve.count_primes();
        }
    };
    let duration = start.elapsed().as_secs_f64();

    let valid = expected_count(LIMIT) == Some(count);
    eprintln!("Passes: {passes}, Time: {duration}, Limit: {LIMIT}, Count: {count}, Valid: {valid}");
    println!("eliaswatson;{passes};{duration:.6};1;algorithm=base,faithful=yes,bits=8");
}
