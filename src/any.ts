import { stringMatchers } from './matchers/string-matchers'
import { CustomMatcher } from './matchers/custom-matcher'
import { numberMatchers } from './matchers/number-matchers'

export const any = Object.assign(CustomMatcher.matcher, {
  string: stringMatchers,
  number: numberMatchers,
  boolean: () => CustomMatcher.matcher<boolean>(actual => typeof actual === 'boolean'),
  function: () => CustomMatcher.matcher<Function>(actual => typeof actual === 'function'),
  object: () => CustomMatcher.matcher<object>(actual => typeof actual === 'object' && actual !== null && !Array.isArray(actual)),
  array: () => CustomMatcher.matcher<any[]>(actual => Array.isArray(actual)),
  map: () => CustomMatcher.matcher<Map<any, any>>(actual => actual instanceof Map),
  instanceOf: (ctor: new (...args: any[]) => any) => CustomMatcher.matcher<any>(actual => actual instanceof ctor),
})
