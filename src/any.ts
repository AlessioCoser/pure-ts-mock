import { stringMatchers } from './matchers/string-matchers'
import { Any } from './matchers/any-matcher'
import { numberMatchers } from './matchers/number-matchers'

/**
 * Provides flexible matchers for arguments and object properties in mocks and verifications.
 * Use built-in matchers like any(), any.string(), any.number(), or create custom matchers.
 * @example usage in mock method setup
 * when(mockedRepo).findById(any()).willReturn(model)
 * @example usage in verification
 * verify(mockedRepo).findById.toHaveBeenCalledWith(any.string())
 * @example custom matcher
 * const anyBetweenMatcher = (a: number, b: number) => any<number>(actual => actual > a && actual < b)
 */
export const any = Object.assign(Any.matcher, {
  /**
   * Matcher for any string value.
   * Includes matchers for any string, substring, prefix, suffix, and others.
   *
   * @example
   * any.string()
   * any.string.includes('foo')
   * any.string.startsWith('bar')
   * any.string.endsWith('baz')
   * any.string.match(/baz/)
   */
  string: stringMatchers,
  /**
   * Matcher for any number value.
   * Includes matchers for any number, any positive, any negative and others.
   *
   * @example
   * any.number()
   * any.number.greaterThan(5)
   * any.number.lessThan(10)
   * any.number.positive()
   * any.number.negative()
   */
  number: numberMatchers,
  /**
   * Matches any boolean value.
   */
  boolean: () => Any.matcher<boolean>(actual => typeof actual === 'boolean'),
  /**
   * Matches any function value.
   */
  function: () => Any.matcher<Function>(actual => typeof actual === 'function'),
  /**
   * Matches any object (not array).
   */
  object: () => Any.matcher<object>(actual => typeof actual === 'object' && actual !== null && !Array.isArray(actual)),
  /**
   * Matches any array value.
   */
  array: () => Any.matcher<any[]>(actual => Array.isArray(actual)),
  /**
   * Matches any Map instance.
   */
  map: () => Any.matcher<Map<any, any>>(actual => actual instanceof Map),
  /**
   * Matches any instance of the given class (including subclasses).
   * @param ctor The constructor to match against.
   */
  instanceOf: <T>(ctor: new (...args: any[]) => T) => Any.matcher<T>(actual => actual instanceof ctor),
})
