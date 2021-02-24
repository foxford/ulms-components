/* globals expect, describe, it, beforeEach */
import { LockProvider } from './lock-provider'

describe('LockProvider', () => {
  let provider

  beforeEach(() => {
    provider = new LockProvider()
  })

  it('update series', () => {
    provider.labels([])

    provider.onUpdate((prev, updated) => {
      expect(updated).toBe(true)
    })

    provider.labels(['label_1', 'label_2'])
    provider.labels(['label_1', 'label_3'])

    expect(provider.isLocked('label_3')).toBe(true)
  })
})
