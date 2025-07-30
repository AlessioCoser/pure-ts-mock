'use strict'
// slightly modified version of https://github.com/epoberezkin/fast-deep-equal/

import { Any } from './any'

export function equal(a: any, b: any): boolean {
  if (a instanceof Any) return a.match(b)
  if (b instanceof Any) return b.match(a)

  if (a === b) return true

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false

    var length, i, keys
    if (Array.isArray(a)) {
      length = a.length
      if (length !== b.length) return false
      for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false
      return true
    }

    if (a instanceof Map && b instanceof Map) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false
      return true
    }

    if (a instanceof Set && b instanceof Set) {
      if (a.size !== b.size) return false
      for (i of a.entries()) if (!b.has(i[0])) return false
      return true
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.byteLength
      if (length !== b.byteLength) return false
      const aBytes = new Uint8Array(a.buffer, a.byteOffset, a.byteLength)
      const bBytes = new Uint8Array(b.buffer, b.byteOffset, b.byteLength)
      for (i = length; i-- !== 0; ) if (aBytes[i] !== bBytes[i]) return false
      return true
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf()
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString()

    keys = Object.keys(a)
    length = keys.length
    if (length !== Object.keys(b).length) return false
    for (i = 0; i < length; i++) {
      const key = keys[i] as PropertyKey
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false
      const aVal = a[key]
      const bVal = b[key]
      if (aVal instanceof Any) {
        return aVal.match(bVal)
      } else if (bVal instanceof Any) {
        return bVal.match(aVal)
      } else if (!equal(aVal, bVal)) {
        return false
      }
    }
    return true
  }

  // true if both NaN, false otherwise
  return a !== a && b !== b
}
