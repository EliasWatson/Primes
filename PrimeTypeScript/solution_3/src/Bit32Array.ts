import { IBitArray } from "./IBitArray";

export class Bit32Array extends IBitArray {
  private readonly bits: Uint32Array;

  constructor(size: number) {
    super(size);
    this.bits = new Uint32Array((size / 32) + 1);
  }

  public get name() {
    return '32bit-array';
  }

  // JS shift counts are taken modulo 32, so `1 << i` already selects bit
  // `i % 32` and the explicit mask is redundant. Every bitwise operator lowers
  // to a runtime helper call under scriptc, so dropping it is worth real time.
  public get(i: number) {
    return (this.bits[i >> 5] >> i) & 1;
  }

  public setTrue(i: number) {
    const bits = this.bits;
    const ixByte = i >> 5; // Integer divide by 32
    bits[ixByte] = bits[ixByte] | (1 << i);
  }

  public get bitsPerFlag() {
    return 1;
  }
}
