import { customMatch } from './custom-matcher'

export const stringIncludes = (substring: string) => customMatch(actual => String(actual).includes(substring))
export const stringStartsWith = (prefix: string) => customMatch(actual => String(actual).startsWith(prefix))
export const stringEndsWith = (prefix: string) => customMatch(actual => String(actual).endsWith(prefix))
