import { stringMatchers } from './matchers/string-matchers'
import { Any } from './matchers/any-matcher'
import { numberMatchers } from './matchers/number-matchers'

/**
 * Provides flexible matchers for arguments and object properties in mocks and verifications.
 * Use built-in matchers, or create a custom one.
 * @example
 * any()
 * any.string() // other matchers available on any.string.
 * any.number() // other matchers available on any.number.
 * any.boolean()
 * any.function()
 * any.object()
 * any.array()
 * any.map()
 * any.instanceOf(MyClass)
 * any.uuid()
 * any<number>(actual => actual > 5) // custom matcher "greater than 5"
 */
export const any = Object.assign(Any.matcher, {
  /**
   * Matcher for any string value.
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
  /**
   * Matches any string that is a valid UUID (version 1-5).
   * @example
   * any.uuid()
   */
  uuid: () =>
    Any.matcher<string>(actual =>
      new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/).test(
        String(actual)
      )
    ),
})
