import { Any } from './any-matcher'

const anyNumberMatcher = () => Any.matcher<number>(actual => typeof actual === 'number', 'any.number()')

export const numberMatchers = Object.assign(anyNumberMatcher, {
  greaterThan: (value: number) =>
    Any.matcher<number>(actual => typeof actual === 'number' && actual > value, `any.number.greaterThan(${value})`),
  lowerThan: (value: number) =>
    Any.matcher<number>(actual => typeof actual === 'number' && actual < value, `any.number.lowerThan(${value})`),
  positive: () => Any.matcher<number>(actual => typeof actual === 'number' && actual >= 0, 'any.number.positive()'),
  negative: () => Any.matcher<number>(actual => typeof actual === 'number' && actual < 0, 'any.number.negative()'),
})
