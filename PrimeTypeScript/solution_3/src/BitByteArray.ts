import { IBitArray } from "./IBitArray";

export class BitByteArray extends IBitArray {
  private readonly bits: Uint8Array;

  constructor(size: number) {
    super(size);
    this.bits = new Uint8Array(size);
  }

  public get name() {
    return 'byte-array';
  }

  public get(i: number) {
    return this.bits[i] || 0;
  }

  public setTrue(i: number) {
    this.bits[i] = 1;
  }

  public get bitsPerFlag() {
    return 8;
  }
}
