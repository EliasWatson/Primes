// Ported from solution_2, where this was an `interface`. scriptc lowers an
// interface to a structural record shape, so an interface-typed slot cannot
// hold four different classes. An abstract base class gives real dynamic
// dispatch, which is what solution_2 relied on anyway.
export abstract class IBitArray {
  constructor(
    public readonly size: number
  ) {}

  abstract get name(): string;
  abstract get(i: number): number;
  abstract setTrue(i: number): void;
  abstract get bitsPerFlag(): number; // 0 means "unknown"
}
