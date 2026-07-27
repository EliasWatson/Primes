import { IBitArray } from "./IBitArray";

export class BitNumArray extends IBitArray {
  private readonly bits: number[];

  constructor(size: number) {
    super(size);
    // solution_2 started from `[]` and let out-of-bounds writes grow the array.
    // scriptc arrays are bounds-checked, so the storage is sized up front.
    const bits: number[] = [];
    for (let i = 0; i < size; i++) bits.push(0);
    this.bits = bits;
  }

  public get name() {
    return 'number-array';
  }

  public get(i: number) {
    return this.bits[i] || 0;
  }

  public setTrue(i: number) {
    this.bits[i] = 1;
  }

  public get bitsPerFlag() {
    return 0; // unknown
  }
}
