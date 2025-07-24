import { describe, expect, it } from 'vitest'
import { equal } from '../src/equal.js'
import { any } from '../src/any.js'

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
      a                                     | b                                     | result   | description
      ${{}}                                 | ${{}}                                 | ${true}  | ${'empty objects are equal'}
      ${{ a: 1, b: '2' }}                   | ${{ a: 1, b: '2' }}                   | ${true}  | ${'equal objects (same properties "order")'}
      ${{ a: 1, b: '2' }}                   | ${{ b: '2', a: 1 }}                   | ${true}  | ${'equal objects (different properties "order")'}
      ${{ a: 1, b: '2' }}                   | ${{ a: 1, b: '2', c: [] }}            | ${false} | ${'not equal objects (extra property)'}
      ${{ a: 1, b: '2', c: 3 }}             | ${{ a: 1, b: '2', c: 4 }}             | ${false} | ${'not equal objects (different property values)'}
      ${{ a: 1, b: '2', c: 3 }}             | ${{ a: 1, b: '2', d: 3 }}             | ${false} | ${'not equal objects (different properties)'}
      ${{ a: [{ b: 'c' }] }}                | ${{ a: [{ b: 'c' }] }}                | ${true}  | ${'equal objects (same sub-properties)'}
      ${{ a: [{ b: 'c' }] }}                | ${{ a: [{ b: 'd' }] }}                | ${false} | ${'not equal objects (different sub-property value)'}
      ${{ a: [{ b: 'c' }] }}                | ${{ a: [{ c: 'c' }] }}                | ${false} | ${'not equal objects (different sub-property)'}
      ${{}}                                 | ${[]}                                 | ${false} | ${'empty array and empty object are not equal'}
      ${{}}                                 | ${{ foo: undefined }}                 | ${false} | ${'object with extra undefined properties are not equal #1'}
      ${{ foo: undefined }}                 | ${{}}                                 | ${false} | ${'object with extra undefined properties are not equal #2'}
      ${{ foo: undefined }}                 | ${{ bar: undefined }}                 | ${false} | ${'object with extra undefined properties are not equal #3'}
      ${null}                               | ${null}                               | ${true}  | ${'nulls are equal'}
      ${null}                               | ${undefined}                          | ${false} | ${'null and undefined are not equal'}
      ${null}                               | ${{}}                                 | ${false} | ${'null and empty object are not equal'}
      ${undefined}                          | ${{}}                                 | ${false} | ${'undefined and empty object are not equal'}
      ${{ toString: () => 'Hello world!' }} | ${{ toString: () => 'Hello world!' }} | ${true}  | ${'objects with different `toString` functions returning same values are equal'}
      ${{ toString: () => 'Hello world!' }} | ${{ toString: () => 'Hi!' }}          | ${false} | ${'objects with `toString` functions returning different values are not equal'}
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
      ${{ '0': 0, '1': 1, length: 2 }} | ${[0, 1]}                   | ${false} | ${'pseudo array and equivalent array are not equal'}
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
      a             | b              | result   | description
      ${func1}      | ${func1}       | ${true}  | ${'same function is equal'}
      ${func1}      | ${func2}       | ${false} | ${'different functions are not equal'}
      ${arrowFunc1} | ${arrowFunc1}  | ${true}  | ${'same arrow function is equal'}
      ${arrowFunc1} | ${arrowFunc2}  | ${false} | ${'different arrow functions are not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('maps', () => {
    it.each`
      a                           | b                          | result   | description
      ${new Map([['k1', 'v1']])}  | ${new Map([['k1', 'v1']])} | ${true}  | ${'same map is equal'}
      ${new Map([['k1', 'v1']])}  | ${new Map([['k2', 'v1']])} | ${false} | ${'different map key is not equal'}
      ${new Map([['k1', 'v1']])}  | ${new Map([['k1', 'v2']])} | ${false} | ${'different map value is not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('sets', () => {
    it.each`
      a                      | b                        | result   | description
      ${new Set([1, 2, 3])}  | ${new Set([1, 2, 3])}    | ${true}  | ${'same sets are equal'}
      ${new Set([1, 2, 3])}  | ${new Set([2, 3, 1])}    | ${true}  | ${'same sets with different order are equal'}
      ${new Set([])}         | ${new Set([1])}          | ${false} | ${'set with one more element is not equal'}
      ${new Set([2])}        | ${new Set([1])}          | ${false} | ${'set with a different element is not equal'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('ArrayBuffer views (TypedArrays)', () => {
    it.each`
      a                                | b                                | result   | description
      ${new Uint8Array([1, 2, 3])}     | ${new Uint8Array([1, 2, 3])}     | ${true}  | ${'equal Uint8Array'}
      ${new Uint8Array([1, 2, 3])}     | ${new Uint8Array([1, 2, 4])}     | ${false} | ${'Uint8Array with different values'}
      ${new Uint8Array([1, 2, 3])}     | ${new Uint8Array([1, 2])}        | ${false} | ${'Uint8Array with different lengths'}
      ${new Uint8Array([1, 2, 3])}     | ${new Uint16Array([1, 2, 3])}    | ${false} | ${'different TypedArray types'}
      ${new Float32Array([1.1, 2.2])}  | ${new Float32Array([1.1, 2.2])}  | ${true}  | ${'equal Float32Array'}
      ${new Float32Array([1.1, 2.2])}  | ${new Float32Array([2.2, 1.1])}  | ${false} | ${'Float32Array with different order'}
      ${new Uint8Array([1, 2, 3])}     | ${[1, 2, 3]}                     | ${false} | ${'TypedArray vs normal array'}
    `('$description', async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any property', () => {
    it.each`
      a                  | b                  | result   | description
      ${any('string')}   | ${'text'}          | ${true}  | ${'any string match'}
      ${any('string')}   | ${true}            | ${false} | ${'any string no-match'}
      ${any('number')}   | ${123456}          | ${true}  | ${'any number match'}
      ${any('number')}   | ${'invalid'}       | ${false} | ${'any number no-match'}
      ${any('boolean')}  | ${true}            | ${true}  | ${'any boolean match'}
      ${any('boolean')}  | ${'invalid'}       | ${false} | ${'any boolean no-match'}
      ${any('function')} | ${() => {}}        | ${true}  | ${'any arrow-function match'}
      ${any('function')} | ${func1}           | ${true}  | ${'any function match'}
      ${any('function')} | ${arrowFunc1}      | ${true}  | ${'any arrow function match'}
      ${any('function')} | ${'invalid'}       | ${false} | ${'any function no-match'}
      ${any('object')}   | ${{ a: '1' }}      | ${true}  | ${'any object match'}
      ${any('object')}   | ${'invalid'}       | ${false} | ${'any object no-match'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any constructor property', () => {
    it.each`
      a                  | b                          | result   | description
      ${any(String)}     | ${'text'}                  | ${true}  | ${'any(String) match'}
      ${any(String)}     | ${true}                    | ${false} | ${'any(String) no-match'}
      ${any(Number)}     | ${123456}                  | ${true}  | ${'any(Number) match'}
      ${any(Number)}     | ${'invalid'}               | ${false} | ${'any(Number) no-match'}
      ${any(Boolean)}    | ${true}                    | ${true}  | ${'any(Boolean) match'}
      ${any(Boolean)}    | ${'invalid'}               | ${false} | ${'any(Boolean) no-match'}
      ${any(Function)}   | ${arrowFunc1}              | ${true}  | ${'any(() => {}) match'}
      ${any(Function)}   | ${func1}                   | ${true}  | ${'any(Function) match'}
      ${any(Function)}   | ${'invalid'}               | ${false} | ${'any(Function) no-match'}
      ${any(Object)}     | ${{ a: '1' }}              | ${true}  | ${'any(Object) match'}
      ${any(Object)}     | ${'invalid'}               | ${false} | ${'any(Object) no-match'}
      ${any(Array)}      | ${[1, 2, 3]}               | ${true}  | ${'any(Array) match'}
      ${any(Array)}      | ${'invalid'}               | ${false} | ${'any(Array) no-match'}
      ${any(Map)}        | ${new Map([['k1', 'v1']])} | ${true}  | ${'any(Map) match'}
      ${any(Map)}        | ${new Set(['k1', 'v1'])}   | ${false} | ${'any(Map) no-match'}
      ${any()}           | ${'text'}                  | ${true}  | ${'any() with string match'}
      ${any()}           | ${123456}                  | ${true}  | ${'any() with number match'}
      ${any()}           | ${true}                    | ${true}  | ${'any() with boolean match'}
      ${any()}           | ${{ a: 1 }}                | ${true}  | ${'any() with object match'}
      ${any()}           | ${[1, 2]}                  | ${true}  | ${'any() with array match'}
      ${any()}           | ${func1}                   | ${true}  | ${'any() with function match'}
      ${any()}           | ${arrowFunc1}              | ${true}  | ${'any() with arrow-function match'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('any with custom classes', () => {
    it.each`
      a                  | b                  | result   | description
      ${any(Class1)}     | ${new Class1()}    | ${true}  | ${'any class match'}
      ${any(Class1)}     | ${new SubClass1()} | ${true}  | ${'any sub-class match'}
      ${any(Class1)}     | ${new Class2()}    | ${false} | ${'any class no-match'}
    `(`$description`, async ({ a, b, result }) => expect(equal(a, b)).toBe(result))
  })

  describe('sample objects', () => {
    it('big object', () => {
      const a = {
        prop1: 'value1',
        prop2: 'value2',
        prop3: 'value3',
        prop4: {
          subProp1: 'sub value1',
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, 2, { prop2: 1, prop: 2, prop3: any(String) }, 4, 5],
            subSubProp3: any(Array),
          },
        },
        prop5: 1000,
        prop6: new Date(2016, 2, 10),
      }
      const b = {
        prop5: 1000,
        prop3: 'value3',
        prop1: 'value1',
        prop2: 'value2',
        prop6: new Date('2016/03/10'),
        prop4: {
          subProp2: {
            subSubProp1: 'sub sub value1',
            subSubProp2: [1, 2, { prop2: 1, prop: any(Number), prop3: '1' }, 4, 5],
            subSubProp3: [1, [{ a: 2 }, { b: 3 }], 4],
          },
          subProp1: 'sub value1',
        },
      }
      expect(equal(a, b)).toBe(true)
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