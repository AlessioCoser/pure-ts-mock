export class Any<T> {
  private constructor(private readonly matchFn: (actual: T) => boolean) {}

  match(actual: any) {
    return this.matchFn(actual)
  }

  static matcher<T = any>(matchFn: (actual: any) => boolean = () => true) {
    return new Any<T>(matchFn)
  }
}

export type DeepAny<T> =
  T extends Array<infer U>
    ? Array<DeepAny<U>>
    : T extends object
      ? { [K in keyof T]: DeepAny<T[K]> | Any<T[K]> | T[K] }
      : Any<T> | T
