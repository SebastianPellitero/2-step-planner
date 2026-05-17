import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validate } from '../../middleware/validate'

function makeReqRes(body: unknown) {
  const req = { body } as Request
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  const next = vi.fn() as NextFunction
  return { req, res, next }
}

const TestSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().min(0),
})

describe('validate middleware', () => {
  it('calls next() and assigns parsed data when body is valid', () => {
    const { req, res, next } = makeReqRes({ name: 'Tokyo', count: 5 })
    validate(TestSchema)(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(req.body).toEqual({ name: 'Tokyo', count: 5 })
  })

  it('returns 400 when a required field is missing', () => {
    const { req, res, next } = makeReqRes({ count: 5 }) // missing name
    validate(TestSchema)(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) })
    )
  })

  it('returns 400 when a field has the wrong type', () => {
    const { req, res, next } = makeReqRes({ name: 'Tokyo', count: 'not-a-number' })
    validate(TestSchema)(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('returns 400 when body is null', () => {
    const { req, res, next } = makeReqRes(null)
    validate(TestSchema)(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('strips unknown fields (Zod default strip mode)', () => {
    const { req, res, next } = makeReqRes({ name: 'Tokyo', count: 1, extraField: 'ignored' })
    validate(TestSchema)(req, res, next)
    expect(next).toHaveBeenCalledOnce()
    expect(req.body).not.toHaveProperty('extraField')
  })
})
