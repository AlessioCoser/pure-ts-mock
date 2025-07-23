import { Any } from './equal.js'

export const any = (expectedType?: Function | string) => new Any(expectedType)
