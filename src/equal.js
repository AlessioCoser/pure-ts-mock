'use strict';
// slightly modified version of https://github.com/epoberezkin/fast-deep-equal/

class Any {
  constructor(type) {
    this.type = type;
  }
  matches(value) {
    return typeof value === this.type;
  }
}

export const any = (type) => new Any(type);

export function equal(a, b) {
  if (a instanceof Any) return a.matches(b);
  if (b instanceof Any) return b.matches(a);

  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }

    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      for (i of a.entries())
        if (!equal(i[1], b.get(i[0]))) return false;
      return true;
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) return false;
      for (i of a.entries())
        if (!b.has(i[0])) return false;
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (a[i] !== b[i]) return false;
      return true;
    }

    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = 0; i < length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
      const aVal = a[keys[i]];
      const bVal = b[keys[i]];
      if (aVal instanceof Any) {
        if (!aVal.matches(bVal)) return false;
      } else if (bVal instanceof Any) {
        if (!bVal.matches(aVal)) return false;
      } else if (!equal(aVal, bVal)) {
        return false;
      }
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};