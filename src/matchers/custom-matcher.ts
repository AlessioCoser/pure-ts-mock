
export class CustomMatcher<T> {
  private constructor(private readonly matchFn: (actual: T) => boolean) {}

  match(actual: any) {
    return this.matchFn(actual)
  }

  static matcher<T = any>(matchFn: (actual: any) => boolean = () => true) {
    return new CustomMatcher<T>(matchFn)
  }
}

export type DeepMatcher<T> =
  T extends Array<infer U>
    ? Array<DeepMatcher<U>>
    : T extends object
      ? { [K in keyof T]: DeepMatcher<T[K]> | CustomMatcher<T[K]> | T[K] }
      : CustomMatcher<T> | T
