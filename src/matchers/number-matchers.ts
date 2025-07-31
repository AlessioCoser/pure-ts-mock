import { CustomMatcher } from './custom-matcher'

const anyNumberMatcher = () => CustomMatcher.matcher<number>(actual => typeof actual === 'number')

export const numberMatchers = Object.assign(anyNumberMatcher, {
  greaterThan: (value: number) => CustomMatcher.matcher<number>(actual => Number(actual) > value),
  lowerThan: (value: number) => CustomMatcher.matcher<number>(actual => Number(actual) < value),
  positive: () => CustomMatcher.matcher<number>(actual => Number(actual) >= 0),
  negative: () => CustomMatcher.matcher<number>(actual => Number(actual) < 0),
})
