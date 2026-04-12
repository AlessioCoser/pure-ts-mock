import { Any } from './any-matcher'

const anyNumberMatcher = () => Any.matcher<number>(actual => typeof actual === 'number')

export const numberMatchers = Object.assign(anyNumberMatcher, {
  greaterThan: (value: number) => Any.matcher<number>(actual => typeof actual === 'number' && actual > value),
  lowerThan: (value: number) => Any.matcher<number>(actual => typeof actual === 'number' && actual < value),
  positive: () => Any.matcher<number>(actual => typeof actual === 'number' && actual >= 0),
  negative: () => Any.matcher<number>(actual => typeof actual === 'number' && actual < 0),
})
