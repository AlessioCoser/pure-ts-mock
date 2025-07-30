import { CustomMatcher } from './matchers/custom-matcher'

export const any = (expectedType?: Function | string | CustomMatcher) => new Any(expectedType)

export class Any {
  constructor(private readonly expectedType: any) {}

  match(actual: any) {
    if (this.expectedType === undefined) return true
    if (typeof this.expectedType === 'string') {
      return typeof actual === this.expectedType
    }
    if (this.expectedType instanceof CustomMatcher) {
      return this.expectedType.match(actual)
    }
    return actual != null && (actual.constructor === this.expectedType || actual instanceof this.expectedType)
  }
}
