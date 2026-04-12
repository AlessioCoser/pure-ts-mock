import { describe, expect, it } from 'vitest'
import { equal } from '../src/equal'
import { any } from '../src'

describe('equal', () => {
  describe('scalar', () => {
    it.each`
      a           | b            | result   | description
      ${1}        | ${1}         | ${true}  | ${'equal numbers'}
      ${1}        | ${2}         | ${false} | ${'not equal numbers'}
      ${1}        | ${[]}        | ${false} | ${'number and array are not equal'}
      ${0}        | ${null}      | ${false} | ${'0 and null are not equal'}
      ${'a'}      | ${'a'}       | ${true}  | ${'equal strings'}
      ${'a'}      | ${'b'}       | ${false} | ${'not equal strings'}
      ${''}       | ${null}      | ${false} | ${'empty string and null are not equal'}
      ${null}     | ${null}      | ${true}  | ${'null is equal to null'}
      ${true}     | ${true}      | ${true}  | ${'equal booleans (true)'}
      ${false}    | ${false}     | ${true}  | ${'equal booleans (false)'}
      ${true}     | ${false}     | ${false} | ${'not equal booleans'}
      ${1}        | ${true}      | ${false} | ${'1 and true are not equal'}
      ${0}        | ${false}     | ${false} | ${'0 and false are not equal'}
      ${NaN}      | ${NaN}       | ${true}  | ${'NaN and NaN are equal'}
      ${0}        | ${-0}        | ${true}  | ${'0 and -0 are equal'}
      ${Infinity} | ${Infinity}  | ${true}  | ${'Infinity and Infinity are equal'}
      ${Infinity} | ${-Infinity} | ${false} | ${'Infinity and -Infinity are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('objects', () => {
    it.each`
      a                          | b                          | result   | description
      ${{}}                      | ${{}}                      | ${true}  | ${'empty objects are equal'}
      ${{ a: 1, b: '2' }}        | ${{ a: 1, b: '2' }}        | ${true}  | ${'equal objects (same properties "order")'}
      ${{ a: 1, b: '2' }}        | ${{ b: '2', a: 1 }}        | ${true}  | ${'equal objects (different props "order")'}
      ${{ a: 1, b: '2' }}        | ${{ a: 1, b: '2', c: [] }} | ${false} | ${'not equal objects (extra property)'}
      ${{ a: 1, b: '2', c: 3 }}  | ${{ a: 1, b: '2', c: 4 }}  | ${false} | ${'not equal objects (different prop)'}
      ${{ a: 1, b: '2', c: 3 }}  | ${{ a: 1, b: '2', d: 3 }}  | ${false} | ${'not equal objects (different props)'}
      ${{ a: [{ b: 'c' }] }}     | ${{ a: [{ b: 'c' }] }}     | ${true}  | ${'equal objects (same sub-properties)'}
      ${{ a: [{ b: 'c' }] }}     | ${{ a: [{ b: 'd' }] }}     | ${false} | ${'not equal objects (different sub-prop)'}
      ${{ a: [{ b: 'c' }] }}     | ${{ a: [{ c: 'c' }] }}     | ${false} | ${'not equal objects (different sub-prop)'}
      ${{}}                      | ${[]}                      | ${false} | ${'empty array and empty object arent equal'}
      ${{}}                      | ${{ foo: undefined }}      | ${false} | ${'object with extra undefined properties are not equal #1'}
      ${{ foo: undefined }}      | ${{}}                      | ${false} | ${'object with extra undefined properties are not equal #2'}
      ${{ foo: undefined }}      | ${{ bar: undefined }}      | ${false} | ${'object with extra undefined properties are not equal #3'}
      ${null}                    | ${null}                    | ${true}  | ${'nulls are equal'}
      ${null}                    | ${undefined}               | ${false} | ${'null and undefined are not equal'}
      ${null}                    | ${{}}                      | ${false} | ${'null and empty object are not equal'}
      ${undefined}               | ${{}}                      | ${false} | ${'undefined and empty object are not equal'}
      ${{ toString: () => 'H' }} | ${{ toString: () => 'H' }} | ${true}  | ${'objects with different `toString` functions returning same values are equal'}
      ${{ toString: () => 'H' }} | ${{ toString: () => 'Z' }} | ${false} | ${'objects with `toString` functions returning different values are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('arrays', () => {
    it.each`
      a                                | b                           | result   | description
      ${[]}                            | ${[]}                       | ${true}  | ${'two empty arrays are equal'}
      ${[1, 2, 3]}                     | ${[1, 2, 3]}                | ${true}  | ${'equal arrays'}
      ${[1, 2, 3]}                     | ${[1, 2, 4]}                | ${false} | ${'not equal arrays (different item)'}
      ${[1, 2, 3]}                     | ${[1, 2]}                   | ${false} | ${'not equal arrays (different length)'}
      ${[{ a: 'a' }, { b: 'b' }]}      | ${[{ a: 'a' }, { b: 'b' }]} | ${true}  | ${'equal arrays of objects'}
      ${[{ a: 'a' }, { b: 'b' }]}      | ${[{ a: 'a' }, { b: 'c' }]} | ${false} | ${'not equal arrays of objects'}
      ${{ '0': 0, '1': 1, length: 2 }} | ${[0, 1]}                   | ${false} | ${'pseudo array and equivalent array'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('Date objects', () => {
    it.each`
      a                                       | b                                       | result   | description
      ${new Date('2017-06-16T21:36:48.362Z')} | ${new Date('2017-06-16T21:36:48.362Z')} | ${true}  | ${'equal date objects'}
      ${new Date('2017-06-16T21:36:48.362Z')} | ${new Date('2017-01-01T00:00:00.000Z')} | ${false} | ${'not equal date objects'}
      ${new Date('2017-06-16T21:36:48.362Z')} | ${'2017-06-16T21:36:48.362Z'}           | ${false} | ${'date and string are not equal'}
      ${new Date('2017-06-16T21:36:48.362Z')} | ${{}}                                   | ${false} | ${'date and object are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('regexp objects', () => {
    it.each`
      a        | b         | result   | description
      ${/foo/} | ${/foo/}  | ${true}  | ${'equal RegExp objects'}
      ${/foo/} | ${/bar/}  | ${false} | ${'not equal RegExp objects (different pattern)'}
      ${/foo/} | ${/foo/i} | ${false} | ${'not equal RegExp objects (different flags)'}
      ${/foo/} | ${'foo'}  | ${false} | ${'RegExp and string are not equal'}
      ${/foo/} | ${{}}     | ${false} | ${'RegExp and object are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('functions', () => {
    it.each`
      a             | b             | result   | description
      ${func1}      | ${func1}      | ${true}  | ${'same function is equal'}
      ${func1}      | ${func2}      | ${false} | ${'different functions are not equal'}
      ${arrowFunc1} | ${arrowFunc1} | ${true}  | ${'same arrow function is equal'}
      ${arrowFunc1} | ${arrowFunc2} | ${false} | ${'different arrow functions are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('maps', () => {
    it.each`
      a                          | b                                        | result   | description
      ${new Map([['k1', 'v1']])} | ${new Map([['k1', 'v1']])}               | ${true}  | ${'same map is equal'}
      ${new Map([['k1', 'v1']])} | ${new Map([['k2', 'v1']])}               | ${false} | ${'different map key is not equal'}
      ${new Map([['k1', 'v1']])} | ${new Map([['k1', 'v2']])}               | ${false} | ${'different map value is not equal'}
      ${new Map([['k1', 'v1']])} | ${new Map([['k1', 'v1'], ['k2', 'v2']])} | ${false} | ${'Map with different sizes'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('sets', () => {
    it.each`
      a                     | b                     | result   | description
      ${new Set([1, 2, 3])} | ${new Set([1, 2, 3])} | ${true}  | ${'same sets are equal'}
      ${new Set([1, 2, 3])} | ${new Set([2, 3, 1])} | ${true}  | ${'same sets with different order are equal'}
      ${new Set([])}        | ${new Set([1])}       | ${false} | ${'set with one more element is not equal'}
      ${new Set([2])}       | ${new Set([1])}       | ${false} | ${'set with a different element is not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('ArrayBuffer views (TypedArrays)', () => {
    it.each`
      a                               | b                               | result   | description
      ${new Uint8Array([1, 2, 3])}    | ${new Uint8Array([1, 2, 3])}    | ${true}  | ${'equal Uint8Array'}
      ${new Uint8Array([1, 2, 3])}    | ${new Uint8Array([1, 2, 4])}    | ${false} | ${'Uint8Array with different values'}
      ${new Uint8Array([1, 2, 3])}    | ${new Uint8Array([1, 2])}       | ${false} | ${'Uint8Array with different lengths'}
      ${new Uint8Array([1, 2, 3])}    | ${new Uint16Array([1, 2, 3])}   | ${false} | ${'different TypedArray types'}
      ${new Float32Array([1.1, 2.2])} | ${new Float32Array([1.1, 2.2])} | ${true}  | ${'equal Float32Array'}
      ${new Float32Array([1.1, 2.2])} | ${new Float32Array([2.2, 1.1])} | ${false} | ${'Float32Array with different order'}
      ${new Uint8Array([1, 2, 3])}    | ${[1, 2, 3]}                    | ${false} | ${'TypedArray vs normal array'}
    `('$description', async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any property', () => {
    const validUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

    it.each`
      a                | b                          | result   | description
      ${any.string()}  | ${'text'}                  | ${true}  | ${'any.string() match'}
      ${any.string()}  | ${true}                    | ${false} | ${'any.string() no-match'}
      ${any.number()}  | ${123456}                  | ${true}  | ${'any.number() match'}
      ${any.number()}  | ${'invalid'}               | ${false} | ${'any.number() no-match'}
      ${123}           | ${any.number()}            | ${true}  | ${'b is any.number(), a is number value'}
      ${any.boolean()} | ${true}                    | ${true}  | ${'any.boolean() match'}
      ${any.boolean()} | ${'invalid'}               | ${false} | ${'any.boolean() no-match'}
      ${any.function()}| ${arrowFunc1}              | ${true}  | ${'any.function() with () => {} match'}
      ${any.function()}| ${func1}                   | ${true}  | ${'any.function() with fn match'}
      ${any.function()}| ${'invalid'}               | ${false} | ${'any.function() no-match'}
      ${any.object()}  | ${{ a: '1' }}              | ${true}  | ${'any.object() match'}
      ${any.object()}  | ${'invalid'}               | ${false} | ${'any.object() no-match'}
      ${any.array()}   | ${[1, 2, 3]}               | ${true}  | ${'any.array() match'}
      ${any.array()}   | ${'invalid'}               | ${false} | ${'any.array() no-match'}
      ${any.map()}     | ${new Map([['k1', 'v1']])} | ${true}  | ${'any.map() match'}
      ${any.map()}     | ${new Set(['k1', 'v1'])}   | ${false} | ${'any.map() no-match'}
      ${any.set()}     | ${new Set([1, 2, 3])}      | ${true}  | ${'any.set() match'}
      ${any.set()}     | ${new Map([['k1', 'v1']])} | ${false} | ${'any.set() no-match'}
      ${any.set()}     | ${[1, 2, 3]}               | ${false} | ${'any.set() array no-match'}
      ${any.date()}     | ${new Date()}              | ${true}  | ${'any.date() match'}
      ${any.date()}     | ${'2024-01-01'}            | ${false} | ${'any.date() string no-match'}
      ${any.date()}     | ${123456}                  | ${false} | ${'any.date() number no-match'}
      ${any.truthy()}   | ${1}                       | ${true}  | ${'any.truthy() with 1'}
      ${any.truthy()}   | ${'text'}                  | ${true}  | ${'any.truthy() with string'}
      ${any.truthy()}   | ${{}}                      | ${true}  | ${'any.truthy() with object'}
      ${any.truthy()}   | ${0}                       | ${false} | ${'any.truthy() with 0'}
      ${any.truthy()}   | ${''}                      | ${false} | ${'any.truthy() with empty string'}
      ${any.truthy()}   | ${null}                    | ${false} | ${'any.truthy() with null'}
      ${any.truthy()}   | ${undefined}               | ${false} | ${'any.truthy() with undefined'}
      ${any.falsy()}    | ${0}                       | ${true}  | ${'any.falsy() with 0'}
      ${any.falsy()}    | ${''}                      | ${true}  | ${'any.falsy() with empty string'}
      ${any.falsy()}    | ${null}                    | ${true}  | ${'any.falsy() with null'}
      ${any.falsy()}    | ${undefined}               | ${true}  | ${'any.falsy() with undefined'}
      ${any.falsy()}    | ${1}                       | ${false} | ${'any.falsy() with 1'}
      ${any.falsy()}    | ${'text'}                  | ${false} | ${'any.falsy() with string'}
      ${any.uuid()}     | ${validUuid}               | ${true}  | ${'any.uuid() match'}
      ${any.uuid()}     | ${'non-uuid'}              | ${false} | ${'any.uuid() no-match'}
      ${any()}         | ${'text'}                  | ${true}  | ${'any() with string match'}
      ${any()}         | ${123456}                  | ${true}  | ${'any() with number match'}
      ${any()}         | ${true}                    | ${true}  | ${'any() with boolean match'}
      ${any()}         | ${{ a: 1 }}                | ${true}  | ${'any() with object match'}
      ${any()}         | ${[1, 2]}                  | ${true}  | ${'any() with array match'}
      ${any()}         | ${func1}                   | ${true}  | ${'any() with function match'}
      ${any()}         | ${arrowFunc1}              | ${true}  | ${'any() with arrow-function match'}
      ${any()}         | ${null}                    | ${true}  | ${'any() with null match'}
      ${any()}         | ${undefined}               | ${true}  | ${'any() with undefined match'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with custom classes', () => {
    it.each`
      a                         | b                  | result   | description
      ${any.instanceOf(Class1)} | ${new Class1()}    | ${true}  | ${'any class match'}
      ${any.instanceOf(Class1)} | ${new SubClass1()} | ${true}  | ${'any sub-class match'}
      ${any.instanceOf(Class1)} | ${new Class2()}    | ${false} | ${'any class no-match'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with string matchers', () => {
    it.each`
      a                                  | b                  | result   | description
      ${any.string.includes('included')} | ${'included'}      | ${true}  | ${'any string including exact match'}
      ${any.string.includes('included')} | ${'pref-included'} | ${true}  | ${'any string including with prefix'}
      ${any.string.includes('included')} | ${'included-suff'} | ${true}  | ${'any string including with suffix'}
      ${any.string.includes('included')} | ${'PincludedS'}    | ${true}  | ${'any string including with prefix and suffix'}
      ${any.string.includes('included')} | ${'incl-uded'}     | ${false} | ${'any string including not present'}
      ${any.string.includes('included')} | ${6}               | ${false} | ${'any number including string not matches'}
      ${any.string.includes('included')} | ${undefined}       | ${false} | ${'any undefined including string not matches'}
      ${any.string.startsWith('start')}  | ${'start'}         | ${true}  | ${'any string startsWith exact match'}
      ${any.string.startsWith('start')}  | ${'starting-with'} | ${true}  | ${'any string startsWith with same prefix'}
      ${any.string.startsWith('start')}  | ${'not-start'}     | ${false} | ${'any string startsWith with same suffix'}
      ${any.string.startsWith('start')}  | ${6}               | ${false} | ${'any number startsWith string not matches'}
      ${any.string.startsWith('start')}  | ${undefined}       | ${false} | ${'any undefined startsWith string not matches'}
      ${any.string.endsWith('end')}      | ${'end'}     | ${true}  | ${'any string endsWith exact match'}
      ${any.string.endsWith('end')}      | ${'the-end'} | ${true}  | ${'any string endsWith with same suffix'}
      ${any.string.endsWith('end')}      | ${'ending'}  | ${false} | ${'any string endsWith with same prefix'}
      ${any.string.endsWith('end')}      | ${6}         | ${false} | ${'any number endsWith string not matches'}
      ${any.string.endsWith('end')}      | ${undefined} | ${false} | ${'any undefined endsWith string not matches'}
      ${any.string.match(/^start/)}      | ${'start'}         | ${true}  | ${'any string match exact match'}
      ${any.string.match(/^start/)}      | ${'starting-with'} | ${true}  | ${'any string match with same suffix'}
      ${any.string.match(/^start/)}      | ${'not-start'}     | ${false} | ${'any string match with same prefix'}
      ${any.string.match(/^start/)}      | ${6}               | ${false} | ${'any number match string not matches'}
      ${any.string.match(/^start/)}      | ${undefined}       | ${false} | ${'any undefined match string not matches'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with number matchers', () => {
    it.each`
      a                            | b       | result   | description
      ${any.number.greaterThan(6)} | ${7}         | ${true}  | ${'any number greater than matches'}
      ${any.number.greaterThan(6)} | ${6}         | ${false} | ${'any number greater than not matches'}
      ${any.number.greaterThan(6)} | ${'7'}       | ${false} | ${'any string greaterThan number not matches'}
      ${any.number.greaterThan(6)} | ${undefined} | ${false} | ${'any undefined greaterThan number not matches'}
      ${any.number.lowerThan(6)}   | ${5}         | ${true}  | ${'any number lower than matches'}
      ${any.number.lowerThan(6)}   | ${6}         | ${false} | ${'any number lower than not matches'}
      ${any.number.lowerThan(6)}   | ${'5'}       | ${false} | ${'any string lowerThan number not matches'}
      ${any.number.lowerThan(6)}   | ${undefined} | ${false} | ${'any undefined lowerThan number not matches'}
      ${any.number.positive()}     | ${1}         | ${true}  | ${'any positive number matches'}
      ${any.number.positive()}     | ${0}         | ${false} | ${'zero is not positive'}
      ${any.number.positive()}     | ${-1}        | ${false} | ${'negative number is not positive'}
      ${any.number.positive()}     | ${'1'}       | ${false} | ${'any string positive number not matches'}
      ${any.number.positive()}     | ${undefined} | ${false} | ${'any undefined positive number not matches'}
      ${any.number.negative()}     | ${-1}        | ${true}  | ${'any negative number matches'}
      ${any.number.negative()}     | ${0}         | ${false} | ${'zero is not negative'}
      ${any.number.negative()}     | ${1}         | ${false} | ${'positive number is not negative'}
      ${any.number.negative()}     | ${'-1'}      | ${false} | ${'any string negative number not matches'}
      ${any.number.negative()}     | ${undefined} | ${false} | ${'any undefined negative number not matches'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with custom matcher', () => {
    const anyNumberGreaterThan5 = any<number>(actual => Number(actual) > 5)

    it.each`
      a                        | b        | result   | description
      ${anyNumberGreaterThan5} | ${6}     | ${true}  | ${'custom matcher matching number'}
      ${anyNumberGreaterThan5} | ${1}     | ${false} | ${'custom matcher not matching number'}
      ${anyNumberGreaterThan5} | ${'asd'} | ${false} | ${'custom matcher not-matching string'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with multiple properties', () => {
    it('should match when both properties use any matchers', () => {
      const a = { foo: any.string(), bar: any.number() }
      const b = { foo: 'hello', bar: 42 }
      expect(equal(a, b)).toBe(true)
      expect(equal(b, a)).toBe(true)
    })

    it('should not match if one property does not satisfy the matcher', () => {
      const a = { foo: any.string(), bar: any.number() }
      const b = { foo: 'hello', bar: 'not-a-number' }
      expect(equal(a, b)).toBe(false)
      expect(equal(b, a)).toBe(false)
    })
  })

  describe('any.object.containing', () => {
    it('should match object with extra properties', () => {
      const matcher = any.object.containing({ id: 'first' })
      expect(equal(matcher, { id: 'first', name: 'Thor', age: 30 })).toBe(true)
    })

    it('should not match when required property is missing', () => {
      const matcher = any.object.containing({ id: 'first' })
      expect(equal(matcher, { name: 'Thor' })).toBe(false)
    })

    it('should not match when property value differs', () => {
      const matcher = any.object.containing({ id: 'first' })
      expect(equal(matcher, { id: 'second', name: 'Thor' })).toBe(false)
    })

    it('should support nested matchers', () => {
      const matcher = any.object.containing({ id: any.string(), value: any.number.greaterThan(5) })
      expect(equal(matcher, { id: 'abc', value: 10, extra: true })).toBe(true)
      expect(equal(matcher, { id: 'abc', value: 3, extra: true })).toBe(false)
    })

    it('should not match non-objects', () => {
      const matcher = any.object.containing({ id: 'first' })
      expect(equal(matcher, 'string')).toBe(false)
      expect(equal(matcher, null)).toBe(false)
      expect(equal(matcher, undefined)).toBe(false)
      expect(equal(matcher, 42)).toBe(false)
    })
  })

  describe('any.array sub-matchers', () => {
    describe('any.array.containing', () => {
      it('should match array containing all expected elements', () => {
        expect(equal(any.array.containing([1, 2]), [1, 2, 3])).toBe(true)
      })

      it('should match regardless of order', () => {
        expect(equal(any.array.containing([3, 1]), [1, 2, 3])).toBe(true)
      })

      it('should not match when element is missing', () => {
        expect(equal(any.array.containing([1, 4]), [1, 2, 3])).toBe(false)
      })

      it('should support nested matchers', () => {
        expect(equal(any.array.containing([any.number.greaterThan(5)]), [1, 2, 10])).toBe(true)
        expect(equal(any.array.containing([any.number.greaterThan(5)]), [1, 2, 3])).toBe(false)
      })

      it('should not match non-arrays', () => {
        expect(equal(any.array.containing([1]), 'string')).toBe(false)
        expect(equal(any.array.containing([1]), null)).toBe(false)
      })
    })

    describe('any.array.ofLength', () => {
      it('should match array of exact length', () => {
        expect(equal(any.array.ofLength(3), [1, 2, 3])).toBe(true)
      })

      it('should not match array of different length', () => {
        expect(equal(any.array.ofLength(3), [1, 2])).toBe(false)
        expect(equal(any.array.ofLength(3), [1, 2, 3, 4])).toBe(false)
      })

      it('should not match non-arrays', () => {
        expect(equal(any.array.ofLength(0), '')).toBe(false)
      })
    })

    describe('any.array.containingExactly', () => {
      it('should match same elements in different order', () => {
        expect(equal(any.array.containingExactly([3, 1, 2]), [1, 2, 3])).toBe(true)
      })

      it('should match same elements in same order', () => {
        expect(equal(any.array.containingExactly([1, 2, 3]), [1, 2, 3])).toBe(true)
      })

      it('should not match when extra elements exist', () => {
        expect(equal(any.array.containingExactly([1, 2]), [1, 2, 3])).toBe(false)
      })

      it('should not match when elements are missing', () => {
        expect(equal(any.array.containingExactly([1, 2, 3]), [1, 2])).toBe(false)
      })

      it('should not match when element values differ', () => {
        expect(equal(any.array.containingExactly([1, 2, 4]), [1, 2, 3])).toBe(false)
      })

      it('should support nested matchers', () => {
        expect(equal(any.array.containingExactly([any.string(), 1]), [1, 'hello'])).toBe(true)
      })

      it('should not match non-arrays', () => {
        expect(equal(any.array.containingExactly([1]), 'string')).toBe(false)
      })
    })
  })
})

function func1() {}

function func2() {}

const arrowFunc1 = () => {}
const arrowFunc2 = () => {}

class Class1 {
  method() {
    return true
  }
}

class SubClass1 extends Class1 {
  override method() {
    return false
  }
}

class Class2 {
  method() {
    return false
  }
}
