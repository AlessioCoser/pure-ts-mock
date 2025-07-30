import { CustomMatcher } from './custom-matcher'

export const stringContaining = (substring: string) =>
  new CustomMatcher(actual => String(actual).includes(substring))
