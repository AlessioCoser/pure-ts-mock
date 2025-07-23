import { describe, expect, it } from 'vitest'
import { mock, verify, when } from '../src/mock.js'
import { any } from '../src/any.js'

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

  it('should return undefined on a non-mocked method', async () => {
    const mockedRepo = mock<ModelRepository>()
    expect(mockedRepo.all).toBeUndefined() // TODO: make the method callable?
  })

  it('should return the mocked value when calling a method', async () => {
    const mockedRepo = mock<ModelRepository>()
    when(mockedRepo).all().willResolve([])
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

  it('xxx', async () => {
    const mockedRepo = mock<ModelRepository>()

    mockedRepo.property = 'a-property-value'
    when(mockedRepo).findById('first').willReturn({ id: 'first', externalId: 'ext-first' })
    when(mockedRepo).all().willResolve([])
    when(mockedRepo).findById('second').willReturn({ id: 'second', externalId: 'ext-second' })

    const firstModel = mockedRepo.findById('first')
    const allModels = await mockedRepo.all()
    const secondModel = mockedRepo.findById('second')

    expect(mockedRepo.property).toEqual('a-property-value')
    expect(allModels).toEqual([])
    expect(firstModel).toEqual({ id: 'first', externalId: 'ext-first' })
    expect(secondModel).toEqual({ id: 'second', externalId: 'ext-second' })
    verify(mockedRepo).all.toHaveBeenCalled(1)
    verify(mockedRepo).findById.toHaveBeenCalled(2)
    verify(mockedRepo).findById.toHaveBeenCalledWith('first')
    verify(mockedRepo).findById.toHaveBeenCalledWith('second')
    expect(() => mockedRepo.findById('678')).toThrowError('method <findById> has no matching returnValue')
  })
})
