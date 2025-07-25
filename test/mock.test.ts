import { describe, expect, it } from 'vitest'
import { any, mock, verify, when } from '../src'

interface ModelRepository {
  property: string

  findById(id: string): Model | null

  all(): Promise<Model[]>
}

interface Model {
  id: string
  externalId: string
}

describe('mock', () => {
  it('should set a property', async () => {
    const mockedRepo = mock<ModelRepository>()
    mockedRepo.property = 'a-property-value'
    expect(mockedRepo.property).toEqual('a-property-value')
  })

  it('should throwError on a non-mocked method', async () => {
    const mockedRepo = mock<ModelRepository>()
    expect(() => mockedRepo.all()).toThrow('No match found for method <all> called with arguments: []')
  })

  it('should resolve the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willResolve([])
    expect(await mockedRepo.all()).toEqual([])
  })

  it('should resolve with a 200ms delay the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willResolve([], { delay: 200 })
    expect(await mockedRepo.all()).toEqual([])
  })

  it('should return the mocked value based on the parameter used', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById('first').willReturn({ id: 'first', externalId: 'ext-first' })
    when(mockedRepo).findById('second').willReturn({ id: 'second', externalId: 'ext-second' })
    expect(mockedRepo.findById('first')).toEqual({ id: 'first', externalId: 'ext-first' })
    expect(mockedRepo.findById('second')).toEqual({ id: 'second', externalId: 'ext-second' })
  })

  it('should return the mocked value ignoring the parameter used', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'all', externalId: 'ext-all' })
    expect(mockedRepo.findById('first')).toEqual({ id: 'all', externalId: 'ext-all' })
    expect(mockedRepo.findById('second')).toEqual({ id: 'all', externalId: 'ext-all' })
  })

  it('should throw the mocked value', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willThrow(new Error('this is an error'))
    expect(() => mockedRepo.findById('second')).toThrow(new Error('this is an error'))
  })

  it('should reject the mocked value', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willReject(new Error('this is an error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('this is an error'))
  })

  it('should reject with a 200ms delay the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willReject(new Error('this is an error'), { delay: 200 })
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('this is an error'))
  })

  it('should handle a default property value', async () => {
    const mockedRepo = mock<ModelRepository>({ property: 'default' })
    expect(mockedRepo.property).toStrictEqual('default')
  })

  it('should set a single property', async () => {
    const mockedRepo = mock<ModelRepository>()
    mockedRepo.property = 'updated-value'
    expect(mockedRepo.property).toStrictEqual('updated-value')
  })

  it('should verify a method to have been called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalled()
  })

  it('should verify a method to have been called, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })

    expect(() => verify(mockedRepo).findById.toHaveBeenCalled()).toThrow(
      'Expected method findById to be called at least once, but it was never called.'
    )
  })

  it('should verify a method to have been called nth times', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalled(2)
  })

  it('should verify a method to have been called nth times, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    expect(() => verify(mockedRepo).findById.toHaveBeenCalled(1)).toThrow(
      'Expected method findById to be called 1 times, but was called 2 times.'
    )
  })

  it('should verify a method to have been called with arguments', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    mockedRepo.findById('second')
    verify(mockedRepo).findById.toHaveBeenCalledWith('second')
  })

  it('should verify a method to have been called with arguments, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toHaveBeenCalledWith('second')).toThrow(
      'Expected method findById to be called with arguments:\n["second"]\nBut it was not called.\n' +
        '\n' +
        'Registered calls: [\n\t' +
        '["first"]\n' +
        ']'
    )
  })

  it('should verify a not-mocked method to have been called with arguments, but it is not', async () => {
    const mockedRepo = mock<ModelRepository>()

    expect(() => verify(mockedRepo).findById.toHaveBeenCalledWith('second')).toThrow(
      'Expected method findById to be called with arguments:\n["second"]\nBut it was not called.\n' +
        '\n' +
        'Registered calls: [\n\t' +
        '\n' +
        ']'
    )
  })
})
