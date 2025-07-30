import { anyMatcher } from './matchers/any-matcher'
import { stringMatchers } from './matchers/string-matchers'
import { customMatch } from './matchers/custom-matcher'

export const any = Object.assign(anyMatcher, {
  match: customMatch,
  string: stringMatchers,
})
