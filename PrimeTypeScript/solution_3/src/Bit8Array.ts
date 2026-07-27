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

  public get(i: number) {
    // const ixByte = ~~(i / 8); // Same as math.truc, but fast
    const ixByte = i >> 3; // Integer divide by 8
    const ixBit = i % 8;
    const byte = this.bits[ixByte];
    return (byte & (1 << ixBit)) ? 1 : 0;
  }

  public setTrue(i: number) {
    // const ixByte = ~~(i / 8);
    const ixByte = i >> 3; // Integer divide by 8
    const ixBit = i % 8;
    this.bits[ixByte] = this.bits[ixByte] | (1 << ixBit);
  }

  public get bitsPerFlag() {
    return 1;
  }
}
