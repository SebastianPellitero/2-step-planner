import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt'

export interface AuthRequest extends Request {
  userId: string
  userEmail: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = header.slice(7)
  try {
    const payload = verifyToken(token)
    ;(req as AuthRequest).userId = payload.userId
    ;(req as AuthRequest).userEmail = payload.email
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}
