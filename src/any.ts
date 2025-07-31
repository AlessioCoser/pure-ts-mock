import { stringMatchers } from './matchers/string-matchers'
import { Any } from './matchers/any-matcher'
import { numberMatchers } from './matchers/number-matchers'

export const any = Object.assign(Any.matcher, {
  string: stringMatchers,
  number: numberMatchers,
  boolean: () => Any.matcher<boolean>(actual => typeof actual === 'boolean'),
  function: () => Any.matcher<Function>(actual => typeof actual === 'function'),
  object: () => Any.matcher<object>(actual => typeof actual === 'object' && actual !== null && !Array.isArray(actual)),
  array: () => Any.matcher<any[]>(actual => Array.isArray(actual)),
  map: () => Any.matcher<Map<any, any>>(actual => actual instanceof Map),
  instanceOf: <T>(ctor: new (...args: any[]) => T) => Any.matcher<T>(actual => actual instanceof ctor),
})
