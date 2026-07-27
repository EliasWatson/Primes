import { IBitArray } from "./IBitArray";

export class Bit8Array extends IBitArray {
  private readonly bits: Uint8Array;

  constructor(size: number) {
    super(size);
    this.bits = new Uint8Array((size / 8) + 1);
  }

  public get name() {
    return '8bit-array';
  }

  // Unlike Bit32Array the `& 7` is not redundant here: shift counts are taken
  // modulo 32, not modulo 8.
  public get(i: number) {
    return (this.bits[i >> 3] >> (i & 7)) & 1;
  }

  public setTrue(i: number) {
    const bits = this.bits;
    const ixByte = i >> 3; // Integer divide by 8
    const ixBit = i & 7;
    bits[ixByte] = bits[ixByte] | (1 << ixBit);
  }

  public get bitsPerFlag() {
    return 1;
  }
}
