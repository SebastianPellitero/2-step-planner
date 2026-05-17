import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { signToken } from '../../lib/jwt'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    trip: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    place: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    placeTrip: {
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}))

import { app } from '../../app'
import { prisma } from '../../lib/prisma'

const mockTrip = prisma.trip as unknown as {
  findMany: ReturnType<typeof vi.fn>
  findFirst: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}
const mockPlace = prisma.place as unknown as {
  findFirst: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
}
const mockPlaceTrip = prisma.placeTrip as unknown as {
  findUnique: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
  deleteMany: ReturnType<typeof vi.fn>
}

const USER_ID = 'user-xyz'
const TOKEN = signToken({ userId: USER_ID, email: 'test@example.com' })

const sampleTrip = {
  id: 'trip-1',
  userId: USER_ID,
  name: 'Tokyo 2025',
  description: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  places: [],
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /trips', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/trips')
    expect(res.status).toBe(401)
  })

  it('returns trips for authenticated user', async () => {
    mockTrip.findMany.mockResolvedValue([sampleTrip])
    const res = await request(app)
      .get('/trips')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('Tokyo 2025')
  })

  it('returns empty array when user has no trips', async () => {
    mockTrip.findMany.mockResolvedValue([])
    const res = await request(app)
      .get('/trips')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})

describe('GET /trips/:id', () => {
  it('returns a single trip by ID', async () => {
    mockTrip.findFirst.mockResolvedValue(sampleTrip)
    const res = await request(app)
      .get('/trips/trip-1')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe('trip-1')
  })

  it('returns 404 when trip does not belong to user', async () => {
    mockTrip.findFirst.mockResolvedValue(null)
    const res = await request(app)
      .get('/trips/trip-other')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /trips', () => {
  it('creates a trip and returns 201', async () => {
    mockTrip.create.mockResolvedValue(sampleTrip)
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Tokyo 2025' })

    expect(res.status).toBe(201)
    expect(res.body.data.name).toBe('Tokyo 2025')
  })

  it('returns 400 for empty name', async () => {
    const res = await request(app)
      .post('/trips')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: '' })

    expect(res.status).toBe(400)
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/trips')
      .send({ name: 'Tokyo 2025' })

    expect(res.status).toBe(401)
  })
})

describe('PATCH /trips/:id', () => {
  it('updates a trip name', async () => {
    const updated = { ...sampleTrip, name: 'Osaka 2025' }
    mockTrip.findFirst.mockResolvedValue(sampleTrip)
    mockTrip.update.mockResolvedValue(updated)

    const res = await request(app)
      .patch('/trips/trip-1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'Osaka 2025' })

    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe('Osaka 2025')
  })

  it('returns 404 for a trip not owned by user', async () => {
    mockTrip.findFirst.mockResolvedValue(null)
    const res = await request(app)
      .patch('/trips/trip-other')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ name: 'X' })

    expect(res.status).toBe(404)
  })
})

describe('DELETE /trips/:id', () => {
  it('deletes a trip and returns 204', async () => {
    mockTrip.findFirst.mockResolvedValue(sampleTrip)
    mockTrip.delete.mockResolvedValue(sampleTrip)

    const res = await request(app)
      .delete('/trips/trip-1')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(204)
  })

  it('returns 404 when trip does not exist', async () => {
    mockTrip.findFirst.mockResolvedValue(null)
    const res = await request(app)
      .delete('/trips/nonexistent')
      .set('Authorization', `Bearer ${TOKEN}`)

    expect(res.status).toBe(404)
  })
})

describe('POST /trips/:id/places', () => {
  const PLACE_ID = 'cld5y6fqx0000lk08w0s3fgp5' // valid CUID format

  it('adds a place to a trip', async () => {
    mockTrip.findFirst.mockResolvedValue(sampleTrip)
    mockPlace.findFirst.mockResolvedValue({ id: PLACE_ID, userId: USER_ID, name: 'Den' })
    mockPlaceTrip.findUnique.mockResolvedValue(null) // not already in trip
    mockPlaceTrip.count.mockResolvedValue(0)
    mockPlaceTrip.create.mockResolvedValue({ placeId: PLACE_ID, tripId: 'trip-1', orderIndex: 0 })

    const res = await request(app)
      .post('/trips/trip-1/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ placeId: PLACE_ID })

    expect(res.status).toBe(201)
  })

  it('returns 409 when place is already in the trip', async () => {
    mockTrip.findFirst.mockResolvedValue(sampleTrip)
    mockPlace.findFirst.mockResolvedValue({ id: PLACE_ID, userId: USER_ID })
    mockPlaceTrip.findUnique.mockResolvedValue({ placeId: PLACE_ID, tripId: 'trip-1' }) // already exists

    const res = await request(app)
      .post('/trips/trip-1/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ placeId: PLACE_ID })

    expect(res.status).toBe(409)
  })

  it('returns 404 when trip does not exist', async () => {
    mockTrip.findFirst.mockResolvedValue(null)
    mockPlace.findFirst.mockResolvedValue({ id: PLACE_ID })

    const res = await request(app)
      .post('/trips/nonexistent/places')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ placeId: PLACE_ID })

    expect(res.status).toBe(404)
  })
})

describe('POST /trips/import', () => {
  it('creates a trip and its places from export JSON', async () => {
    mockTrip.create.mockResolvedValue(sampleTrip)
    mockPlace.create.mockResolvedValue({ id: 'p-new', name: 'Den', userId: USER_ID })
    mockPlaceTrip.create.mockResolvedValue({ placeId: 'p-new', tripId: 'trip-1', orderIndex: 0 })
    mockTrip.findFirst.mockResolvedValue({ ...sampleTrip, places: [{ place: { name: 'Den' }, orderIndex: 0 }] })

    const exportPayload = {
      version: '1.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      name: 'Tokyo 2025',
      places: [
        { name: 'Den', type: 'RESTAURANT', lat: 35.69, lng: 139.75 },
      ],
    }

    const res = await request(app)
      .post('/trips/import')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send(exportPayload)

    expect(res.status).toBe(201)
    expect(mockTrip.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ name: 'Tokyo 2025', userId: USER_ID }) })
    )
    expect(mockPlace.create).toHaveBeenCalledTimes(1)
  })

  it('returns 400 for invalid import payload (wrong version)', async () => {
    const res = await request(app)
      .post('/trips/import')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ version: '2.0', name: 'Bad', places: [] })

    expect(res.status).toBe(400)
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/trips/import')
      .send({ version: '1.0', name: 'Trip', places: [] })

    expect(res.status).toBe(401)
  })
})
