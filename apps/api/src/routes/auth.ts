import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { validate } from '../middleware/validate'
import { RegisterSchema, LoginSchema } from '@holiday-planner/shared'

export const authRouter = Router()

authRouter.post('/register', validate(RegisterSchema), async (req, res) => {
  const { email, password } = req.body

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(409).json({ error: 'Email already in use' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true, createdAt: true },
  })

  const token = signToken({ userId: user.id, email: user.email })
  return res.status(201).json({ data: { user, token } })
})

authRouter.post('/login', validate(LoginSchema), async (req, res) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = signToken({ userId: user.id, email: user.email })
  const { passwordHash: _, ...safeUser } = user
  return res.json({ data: { user: safeUser, token } })
})
