export const any = (expectedType?: Function | string) => new Any(expectedType)

export class Any {
  constructor(private readonly expectedType: any) {}

  match(actual: any) {
    if (this.expectedType === undefined) return true
    if (typeof this.expectedType === 'string') {
      return typeof actual === this.expectedType
    }
    return actual != null && (actual.constructor === this.expectedType || actual instanceof this.expectedType)
  }
}
