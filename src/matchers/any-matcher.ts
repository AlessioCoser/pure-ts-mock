export class Any<T> {
  private constructor(
    private readonly matchFn: (actual: T) => boolean,
    private readonly label: string
  ) {}

  match(actual: any) {
    return this.matchFn(actual)
  }

  toJSON() {
    return this.label
  }

  static matcher<T = any>(matchFn: (actual: any) => boolean = () => true, label: string = 'any()') {
    return new Any<T>(matchFn, label)
  }
}

export type DeepAny<T> =
  T extends Array<infer U>
    ? Array<DeepAny<U>>
    : T extends object
      ? { [K in keyof T]: DeepAny<T[K]> | Any<T[K]> | T[K] }
      : Any<T> | T
