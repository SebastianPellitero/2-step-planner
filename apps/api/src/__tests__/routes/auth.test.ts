import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// Mock prisma before importing app
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { app } from '../../app'
import { prisma } from '../../lib/prisma'

const mockUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /auth/register', () => {
  it('creates a user and returns token on valid input', async () => {
    mockUser.findUnique.mockResolvedValue(null) // no existing user
    mockUser.create.mockResolvedValue({ id: 'u1', email: 'test@example.com', createdAt: new Date() })

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data.user.email).toBe('test@example.com')
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('returns 409 when email is already in use', async () => {
    mockUser.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' })

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/already in use/i)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'password123' })

    expect(res.status).toBe(400)
  })

  it('returns 400 for password shorter than 8 chars', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'short' })

    expect(res.status).toBe(400)
  })
})

describe('POST /auth/login', () => {
  it('returns token on valid credentials', async () => {
    // bcrypt hash of 'password123'
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash('password123', 1) // rounds=1 for speed in tests

    mockUser.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('token')
    expect(res.body.data.user).not.toHaveProperty('passwordHash')
  })

  it('returns 401 when user does not exist', async () => {
    mockUser.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/invalid credentials/i)
  })

  it('returns 401 when password is wrong', async () => {
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash('correct-password', 1)

    mockUser.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      passwordHash,
    })

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
  })

  it('returns 400 for missing password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com' })

    expect(res.status).toBe(400)
  })
})
