import { Any } from './any-matcher'

const anyStringMatcher = () => Any.matcher<string>(actual => typeof actual === 'string')

export const stringMatchers = Object.assign(anyStringMatcher, {
  includes: (substring: string) => Any.matcher<string>(actual => String(actual).includes(substring)),
  startsWith: (prefix: string) => Any.matcher<string>(actual => String(actual).startsWith(prefix)),
  endsWith: (prefix: string) => Any.matcher<string>(actual => String(actual).endsWith(prefix)),
  match: (pattern: RegExp) => Any.matcher<string>(actual => pattern.test(String(actual))),
})
