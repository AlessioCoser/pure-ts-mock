import { customMatch, CustomMatcher } from './custom-matcher'

export const anyMatcher = (expectedType?: Function | string): CustomMatcher =>
  customMatch(actual => {
    if (expectedType === undefined) return true
    if (typeof expectedType === 'string') {
      return typeof actual === expectedType
    }
    return actual != null && (actual.constructor === expectedType || actual instanceof expectedType)
  })
