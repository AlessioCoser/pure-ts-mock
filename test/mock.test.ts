import { describe, expect, it } from 'vitest'
import { any, mock, verify, when } from '../src'

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

  it('should verify a method to not have been called', async () => {
    const mockedRepo = mock<ModelRepository>()
    verify(mockedRepo).findById.toNotHaveBeenCalled()
  })

  it('should verify a method to not have been called, but it is called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toNotHaveBeenCalled()).toThrow(
      'Expected method findById to not be called, but it was called 1 times.\n' +
      '\n' +
      'Registered calls: [\n' +
      '\t["first"]\n' +
      ']'
    )
  })

  it('should verify a method to not have been called with argument, but it is called', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    mockedRepo.findById('first')
    expect(() => verify(mockedRepo).findById.toNotHaveBeenCalledWith('first')).toThrow(
      'Expected method findById to not be called with arguments:\n' +
      '["first"]\n' +
      'But it was called with those arguments.\n\n' +
      'Registered calls: [\n\t' +
      '["first"]\n' +
      ']'
    )
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
      'Expected method findById to be called 1 times, but was called 2 times.\n' +
      '\n' +
      'Registered calls: [\n' +
      '\t["first"],\n' +
      '\t["second"]\n' +
      ']'
    )
  })

  it('should verify a method to have been called 1 time, but it is called zero times', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })

    expect(() => verify(mockedRepo).findById.toHaveBeenCalled(1)).toThrow(
      'Expected method findById to be called 1 times, but it was never called.'
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

  it('should mock a class', async () => {
    const mockedRepo = mock<UserRepository>()
    mockedRepo.property = 'an-user-property'
    when(mockedRepo).all().willResolve([])
    when(mockedRepo).findById(any()).willReturn({ id: 'first', name: 'Thor' })

    mockedRepo.findById('first')
    const allUsers = await mockedRepo.all()

    expect(mockedRepo.property).toEqual('an-user-property')
    expect(allUsers).toEqual([])
    verify(mockedRepo).findById.toHaveBeenCalledWith('first')
    verify(mockedRepo).all.toHaveBeenCalled()
  })

  it('override the behavior of a method. The last defined behavior will take precedence.', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willResolve([{ id: 'first', externalId: 'ext-first' }])
    when(mockedRepo).all().willResolve([{ id: 'second', externalId: 'ext-second' }])

    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
  })

  it('do not keep the programmed method with willResolveOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willResolve([{ id: 'first', externalId: 'ext-first' }])
    when(mockedRepo).all().willResolveOnce([{ id: 'second', externalId: 'ext-second' }])

    expect(await mockedRepo.all()).toEqual([{ id: 'second', externalId: 'ext-second' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'first', externalId: 'ext-first' }])
    expect(await mockedRepo.all()).toEqual([{ id: 'first', externalId: 'ext-first' }])
  })

  it('do not keep the programmed method with willRejectOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willReject(new Error('first programmed error'))
    when(mockedRepo).all().willRejectOnce(new Error('second programmed once error'))

    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('second programmed once error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('first programmed error'))
    await expect(() => mockedRepo.all()).rejects.toThrow(new Error('first programmed error'))
  })

  it('do not keep the programmed method with willReturnOnce ', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willReturn({ id: 'first', externalId: 'ext-first' })
    when(mockedRepo).findById(any()).willReturnOnce({ id: 'second', externalId: 'ext-second' })

    expect(mockedRepo.findById('any')).toEqual({ id: 'second', externalId: 'ext-second' })
    expect(mockedRepo.findById('any')).toEqual({ id: 'first', externalId: 'ext-first' })
    expect(mockedRepo.findById('any')).toEqual({ id: 'first', externalId: 'ext-first' })
  })

  it('do not keep the programmed method with willThrowOnce', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).findById(any()).willThrow(new Error('first programmed error'))
    when(mockedRepo).findById(any()).willThrowOnce(new Error('second programmed once error'))

    expect(() => mockedRepo.findById('any')).toThrow(new Error('second programmed once error'))
    expect(() => mockedRepo.findById('any')).toThrow(new Error('first programmed error'))
    expect(() => mockedRepo.findById('any')).toThrow(new Error('first programmed error'))
  })
})


interface User {
  id: string
  name: string
}

class UserRepository {
  property: string

  constructor() {
    this.property = 'default'
  }

  findById(id: string): User | null {
    return { id, name: Math.random().toString(36) }
  }

  all(): Promise<User[]> {
    return Promise.resolve([])
  }
}

interface ModelRepository {
  property: string

  findById(id: string): Model | null

  all(): Promise<Model[]>
}

interface Model {
  id: string
  externalId: string
}