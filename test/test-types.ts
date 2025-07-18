export type Expect<T extends true> = T;
export type Not<T extends false> = true;
export type IsArray<T> = T extends Array<any> ? true : false;
export type SameShape<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;

export type SameType<T, U> = SameShape<T, U> extends true
  ? SameShape<keyof T, keyof U> extends true
    ? true
    : false
  : false;

// usage:
// type assert = [
//   Expect<Not<SameType<string, "foo">>>,
//   Expect<SameType<string | number, string | number>>,
//   Expect<Not<SameType<string | number, string | number | object>>>,
//   Expect<SameShape<{ a: number }, { a: number; b?: string }>>
// ];
