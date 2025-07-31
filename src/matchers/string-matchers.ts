import { CustomMatcher } from './custom-matcher'

const anyStringMatcher = () => CustomMatcher.matcher<string>(actual => typeof actual === 'string')

export const stringMatchers = Object.assign(anyStringMatcher, {
  includes: (substring: string) => CustomMatcher.matcher<string>(actual => String(actual).includes(substring)),
  startsWith: (prefix: string) => CustomMatcher.matcher<string>(actual => String(actual).startsWith(prefix)),
  endsWith: (prefix: string) => CustomMatcher.matcher<string>(actual => String(actual).endsWith(prefix)),
  match: (pattern: RegExp) => CustomMatcher.matcher<string>(actual => pattern.test(String(actual))),
})
