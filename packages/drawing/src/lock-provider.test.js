/* globals expect, describe, it */
import { LockProvider } from './lock-provider'

describe('LockProvider', () => {
  const provider = LockProvider

  it.skip('update series', () => {
    provider.lockedIds = []

    provider.lockedIds = ['label_1', 'label_2']
    provider.lockedIds = ['label_1', 'label_3']

    expect(provider.isLocked('label_3')).toBe(true)
  })
})
