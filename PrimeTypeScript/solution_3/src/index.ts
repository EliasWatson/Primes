import { Bit8Array } from "./Bit8Array";
import { IBitArray } from "./IBitArray";
import { BitNumArray } from "./BitNumArray";
import { BitByteArray } from "./BitByteArray";
import { Bit32Array } from "./Bit32Array";

const DICT: { [size: number]: number } = {
  10: 4,
  100: 25,
  1000: 168,
  10000: 1229,
  100000: 9592,
  1000000: 78498,
  10000000: 664579,
  100000000: 5761455,
  1000000000: 50847534,
  10000000000: 455052511,
};

class PrimeSieve<T extends IBitArray> {
  public readonly sieveSize: number;

  constructor(
    private readonly bits: T
  ) {
    this.sieveSize = bits.size;
  }

  public runSieve() {
    const bits = this.bits;
    const sieveSize = this.sieveSize;
    let factor = 3;

    // Equivalent to `factor <= Math.sqrt(sieveSize)` for integers;
    // scriptc has no static lowering for Math.sqrt.
    while (factor * factor <= sieveSize) {
      for (let num = factor; num < sieveSize; num += 2) {
        if (!bits.get(num)) {
          factor = num;
          break;
        }
      }

      const inc = factor * 2; // increased speed

      for (let num = factor * factor; num < sieveSize; num += inc) {
        bits.setTrue(num);
      }

      factor += 2;
    }
  }

  public printResults(name: string, bitsPerFlag: number, duration: number, passes: number) {
    const avg = duration / passes;
    const countPrimes = this.countPrimes();
    const valid = this.validateResults();
    console.error(
      `Passes: ${passes}, Time: ${duration}, Avg: ${avg}, Limit: ${this.sieveSize}, Count: ${countPrimes}, Valid: ${valid}`
    );

    // Based on: marghidanu
    // Label distinguishes this native (scriptc) build from solution_2's node run.
    let tagLine = `mikevdbokke-scriptc_${name};${passes};${duration};1;algorithm=base,faithful=yes`;
    if (bitsPerFlag) {
      tagLine += `,bits=${bitsPerFlag}`;
    }
    console.log(tagLine);
  }

  private countPrimes(): number {
    const bits = this.bits;
    const sieveSize = this.sieveSize;
    let count = 1;

    for (let num = 3; num < sieveSize; num += 2) {
      if (!bits.get(num)) count++;
    }

    return count;
  }

  private validateResults(): boolean {
    return DICT[this.sieveSize] === this.countPrimes();
  }
}

let passes = 0;
let startTime = Date.now();
const sieveSize = 1e6;

function runOne<T extends IBitArray>(createArray: (sieveSize: number) => T, sieveSize: number) {
  passes = 0;
  startTime = Date.now();
  while (true) {
    const bitArray: T = createArray(sieveSize);
    const sieve = new PrimeSieve(bitArray);
    sieve.runSieve();
  
    passes++;
    const duration = (Date.now() - startTime) / 1000;
    if (duration >= 5) {
      sieve.printResults(bitArray.name, bitArray.bitsPerFlag, duration, passes);
      break;
    }
  }
}

function main() {
  runOne((sieveSize: number) => {return new Bit32Array(sieveSize)}, sieveSize);
  runOne((sieveSize: number) => {return new Bit8Array(sieveSize)}, sieveSize);
  runOne((sieveSize: number) => {return new BitNumArray(sieveSize)}, sieveSize);
  runOne((sieveSize: number) => {return new BitByteArray(sieveSize)}, sieveSize);
}

main();
