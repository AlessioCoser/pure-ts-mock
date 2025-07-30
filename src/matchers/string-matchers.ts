import { customMatch } from './custom-matcher'

export const stringMatchers = {
  includes: (substring: string) => customMatch(actual => String(actual).includes(substring)),
  startsWith: (prefix: string) => customMatch(actual => String(actual).startsWith(prefix)),
  endsWith: (prefix: string) => customMatch(actual => String(actual).endsWith(prefix)),
  match: (pattern: RegExp) => customMatch(actual => pattern.test(String(actual)))
}