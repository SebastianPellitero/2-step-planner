import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '../../lib/jwt'

describe('signToken / verifyToken', () => {
  const payload = { userId: 'user-123', email: 'test@example.com' }

  it('returns a non-empty string', () => {
    const token = signToken(payload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(20)
  })

  it('round-trips the payload', () => {
    const token = signToken(payload)
    const decoded = verifyToken(token)
    expect(decoded.userId).toBe(payload.userId)
    expect(decoded.email).toBe(payload.email)
  })

  it('throws on a tampered token', () => {
    const token = signToken(payload)
    const tampered = token.slice(0, -5) + 'XXXXX'
    expect(() => verifyToken(tampered)).toThrow()
  })

  it('throws on a completely invalid string', () => {
    expect(() => verifyToken('not.a.jwt')).toThrow()
  })

  it('produces different tokens for different payloads', () => {
    const t1 = signToken({ userId: 'a', email: 'a@a.com' })
    const t2 = signToken({ userId: 'b', email: 'b@b.com' })
    expect(t1).not.toBe(t2)
  })
})
