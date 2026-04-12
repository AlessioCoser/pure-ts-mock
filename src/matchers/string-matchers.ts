import { Any } from './any-matcher'

const anyStringMatcher = () => Any.matcher<string>(actual => typeof actual === 'string', 'any.string()')

export const stringMatchers = Object.assign(anyStringMatcher, {
  includes: (substring: string) =>
    Any.matcher<string>(actual => typeof actual === 'string' && actual.includes(substring), `any.string.includes("${substring}")`),
  startsWith: (prefix: string) =>
    Any.matcher<string>(actual => typeof actual === 'string' && actual.startsWith(prefix), `any.string.startsWith("${prefix}")`),
  endsWith: (suffix: string) =>
    Any.matcher<string>(actual => typeof actual === 'string' && actual.endsWith(suffix), `any.string.endsWith("${suffix}")`),
  match: (pattern: RegExp) =>
    Any.matcher<string>(actual => typeof actual === 'string' && pattern.test(actual), `any.string.match(${pattern})`),
})
