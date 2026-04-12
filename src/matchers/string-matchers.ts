import { Any } from './any-matcher'

const anyStringMatcher = () => Any.matcher<string>(actual => typeof actual === 'string')

export const stringMatchers = Object.assign(anyStringMatcher, {
  includes: (substring: string) => Any.matcher<string>(actual => typeof actual === 'string' && actual.includes(substring)),
  startsWith: (prefix: string) => Any.matcher<string>(actual => typeof actual === 'string' && actual.startsWith(prefix)),
  endsWith: (suffix: string) => Any.matcher<string>(actual => typeof actual === 'string' && actual.endsWith(suffix)),
  match: (pattern: RegExp) => Any.matcher<string>(actual => typeof actual === 'string' && pattern.test(actual)),
})
