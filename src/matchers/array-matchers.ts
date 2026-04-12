import { equal } from '../equal'
import { Any } from './any-matcher'

const anyArrayMatcher = () => Any.matcher<any[]>(actual => Array.isArray(actual), 'any.array()')

export const arrayMatchers = Object.assign(anyArrayMatcher, {
  ofLength: (length: number) =>
    Any.matcher<any[]>(actual => Array.isArray(actual) && actual.length === length, `any.array.ofLength(${length})`),
  containing: (expected: any[]) =>
    Any.matcher<any[]>(
      actual => Array.isArray(actual) && expected.every(exp => actual.some(act => equal(act, exp))),
      `any.array.containing(${JSON.stringify(expected)})`
    ),
  containingExactly: (expected: any[]) =>
    Any.matcher<any[]>(
      actual =>
        Array.isArray(actual) &&
        actual.length === expected.length &&
        expected.every(exp => actual.some(act => equal(act, exp))),
      `any.array.containingExactly(${JSON.stringify(expected)})`
    ),
})
