import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { clearPreviousAccount } from '@/lib/session-privacy'

describe('Account data isolation', () => {
  it('removes customer records when an administrator signs out', () => {
    const client = new QueryClient()
    client.setQueryData(['management'], { rows: [{ email: 'private@example.com' }] })
    clearPreviousAccount(client, 'admin', null)
    expect(client.getQueryData(['management'])).toBeUndefined()
  })
  it('removes previous customer records when switching accounts', () => {
    const client = new QueryClient()
    client.setQueryData(['management'], { allowed: true, rows: [{ phone: '11912345678' }] })
    clearPreviousAccount(client, 'admin', 'customer')
    expect(client.getQueryCache().getAll()).toHaveLength(0)
  })
  it('preserves data only for the same identity', () => {
    const client = new QueryClient()
    client.setQueryData(['management'], { allowed: true })
    expect(clearPreviousAccount(client, 'admin', 'admin')).toBe(false)
    expect(client.getQueryData(['management'])).toEqual({ allowed: true })
  })
})