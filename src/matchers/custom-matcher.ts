export const customMatch = (matchFn: (actual: any) => boolean) => new CustomMatcher(matchFn)

export class CustomMatcher {
  constructor(private readonly matchFn: (actual: any) => boolean) {}

  match(actual: any) {
    return this.matchFn(actual)
  }
}
