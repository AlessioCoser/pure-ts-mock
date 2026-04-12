import { Any } from './any-matcher'
import { equal } from '../equal'

const anyObjectMatcher = () =>
  Any.matcher<object>(actual => typeof actual === 'object' && actual !== null && !Array.isArray(actual), 'any.object()')

export const objectMatchers = Object.assign(anyObjectMatcher, {
  containing: <T extends Record<string, any>>(partial: T) =>
    Any.matcher<T>(
      actual =>
        typeof actual === 'object' &&
        actual !== null &&
        Object.keys(partial).every(key => Object.prototype.hasOwnProperty.call(actual, key) && equal(partial[key], actual[key])),
      `any.object.containing(${JSON.stringify(partial)})`
    ),
})
