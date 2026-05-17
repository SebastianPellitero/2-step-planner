import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { signToken } from '../../lib/jwt'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    place: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { app } from '../../app'
import { prisma } from '../../lib/prisma'

const mockPlace = prisma.place as unknown as {
  findMany: ReturnType<typeof vi.fn>
  findFirst: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const USER_ID = 'user-abc'
const TOKEN = signToken({ userId: USER_ID, email: 'test@example.com' })

const samplePlace = {
  id: 'place-1',
  userId: USER_ID,
  name: 'Den',
  type: 'RESTAURANT',
  lat: 35.69,
  lng: 139.75,
  visited: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  trips: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /places', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/places')
    expect(res.status).toBe(401)
  })

  it('returns places for authenticated user', async () => {
    mockPlace.findMany.mockResolvedValue([samplePlace])
    const res = await request(app)
      .get('/places')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('Den')
  })

  it('passes filter params to prisma query', async () => {
    mockPlace.findMany.mockResolvedValue([])
    await request(app)
      .get('/places?type=RESTAURANT&visited=true')
      .set('Authorization', `Bearer ${TOKEN}`)

    const whereArg = mockPlace.findMany.mock.calls[0][0].where
    expect(whereArg.type).toBe('RESTAURANT')
    expect(whereArg.visited).toBe(true)
  })
})

describe('POST /places', () => {
  it('creates a place and returns 201', async () => {
    mockPlace.create.mockResolvedValue(samplePlace)
    const res = await request(app)
      .post('/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Den', type: 'RESTAURANT' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Den')
  })

  it('returns 400 for missing name', async () => {
    const res = await request(app)
      .post('/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ type: 'RESTAURANT' })

    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid type', async () => {
    const res = await request(app)
      .post('/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Den', type: 'INVALID_TYPE' })

    expect(res.status).toBe(400)
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/places')
      .send({ name: 'Den', type: 'RESTAURANT' })

    expect(res.status).toBe(401)
  })
})

describe('PATCH /places/:id', () => {
  it('updates a place when user owns it', async () => {
    const updated = { ...samplePlace, name: 'Den (Updated)' }
    mockPlace.findFirst.mockResolvedValue(samplePlace)
    mockPlace.update.mockResolvedValue(updated)

    const res = await request(app)
      .patch('/places/place-1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Den (Updated)' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Den (Updated)')
  })

  it('returns 404 when place does not belong to user', async () => {
    mockPlace.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .patch('/places/nonexistent')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'New Name' })

    expect(res.status).toBe(404)
  })

  it('can mark a place as visited', async () => {
    const visited = { ...samplePlace, visited: true }
    mockPlace.findFirst.mockResolvedValue(samplePlace)
    mockPlace.update.mockResolvedValue(visited)

    const res = await request(app)
      .patch('/places/place-1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ visited: true })

    expect(res.status).toBe(200)
    expect(res.body.data.visited).toBe(true)
  })
})

describe('DELETE /places/:id', () => {
  it('deletes a place owned by the user', async () => {
    mockPlace.findFirst.mockResolvedValue(samplePlace)
    mockPlace.delete.mockResolvedValue(samplePlace)

    const res = await request(app)
      .delete('/places/place-1')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(204)
  })

  it('returns 404 when place not found', async () => {
    mockPlace.findFirst.mockResolvedValue(null)

    const res = await request(app)
      .delete('/places/nonexistent')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(404)
  })
})
