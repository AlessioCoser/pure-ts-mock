export class CustomMatcher {
  constructor(private readonly matchFn: (actual: any) => boolean) {
  }

  match(actual: any) {
    return this.matchFn(actual)
  }
}