import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiClient } from '../api-client'

const BASE_URL = 'http://localhost:3001'

function makeClient() {
  return new ApiClient(BASE_URL)
}

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(global, 'fetch').mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ApiClient — token management', () => {
  it('sends no Authorization header when token is null', async () => {
    const spy = mockFetch({ data: [] })
    const client = makeClient()
    await client.getPlaces()
    const [, init] = spy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('sends Bearer token when set', async () => {
    const spy = mockFetch({ data: [] })
    const client = makeClient()
    client.setToken('my-jwt-token')
    await client.getPlaces()
    const [, init] = spy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBe('Bearer my-jwt-token')
  })

  it('clears token when setToken(null) is called', async () => {
    const client = makeClient()
    client.setToken('my-jwt-token')
    client.setToken(null)
    const spy = mockFetch({ data: [] })
    await client.getPlaces()
    const [, init] = spy.mock.calls[0]
    expect((init?.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })
})

describe('ApiClient — error handling', () => {
  it('throws an Error with the server error message on non-ok response', async () => {
    mockFetch({ error: 'Not found' }, 404)
    const client = makeClient()
    await expect(client.getTrip('missing-id')).rejects.toThrow('Not found')
  })

  it('throws fallback message when error field is absent', async () => {
    mockFetch({}, 500)
    const client = makeClient()
    await expect(client.getPlaces()).rejects.toThrow('Request failed: 500')
  })
})

describe('ApiClient — auth', () => {
  it('login posts credentials and returns user + token', async () => {
    const spy = mockFetch({ data: { user: { id: '1', email: 'a@b.com' }, token: 'tok' } })
    const client = makeClient()
    const result = await client.login({ email: 'a@b.com', password: 'pass' })
    expect(result.token).toBe('tok')
    expect(result.user.email).toBe('a@b.com')
    const [url, init] = spy.mock.calls[0]
    expect(url).toBe(`${BASE_URL}/auth/login`)
    expect(init?.method).toBe('POST')
  })

  it('register posts credentials and returns user + token', async () => {
    mockFetch({ data: { user: { id: '2', email: 'new@b.com' }, token: 'new-tok' } }, 201)
    const client = makeClient()
    const result = await client.register({ email: 'new@b.com', password: 'password123' })
    expect(result.token).toBe('new-tok')
  })
})

describe('ApiClient — places', () => {
  it('getPlaces calls GET /places', async () => {
    const spy = mockFetch({ data: [] })
    const client = makeClient()
    await client.getPlaces()
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/places`)
  })

  it('getPlaces with filters builds correct query string', async () => {
    const spy = mockFetch({ data: [] })
    const client = makeClient()
    await client.getPlaces({ type: 'RESTAURANT', visited: true })
    expect(spy.mock.calls[0][0]).toContain('type=RESTAURANT')
    expect(spy.mock.calls[0][0]).toContain('visited=true')
  })

  it('createPlace calls POST /places with body', async () => {
    const place = { id: 'p1', name: 'Den', type: 'RESTAURANT', lat: 0, lng: 0, visited: false, userId: 'u1', createdAt: '', updatedAt: '' }
    const spy = mockFetch({ data: place }, 201)
    const client = makeClient()
    const result = await client.createPlace({ name: 'Den', type: 'RESTAURANT', lat: 0, lng: 0 })
    expect(result.name).toBe('Den')
    expect(spy.mock.calls[0][1]?.method).toBe('POST')
  })

  it('deletePlace calls DELETE /places/:id', async () => {
    const spy = mockFetch({ data: null }, 200)
    const client = makeClient()
    await client.deletePlace('p1')
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/places/p1`)
    expect(spy.mock.calls[0][1]?.method).toBe('DELETE')
  })
})

describe('ApiClient — trips', () => {
  it('getTrips calls GET /trips', async () => {
    const spy = mockFetch({ data: [] })
    const client = makeClient()
    await client.getTrips()
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/trips`)
  })

  it('createTrip calls POST /trips', async () => {
    const trip = { id: 't1', name: 'Tokyo', userId: 'u1', createdAt: '', updatedAt: '' }
    const spy = mockFetch({ data: trip }, 201)
    const client = makeClient()
    const result = await client.createTrip({ name: 'Tokyo' })
    expect(result.name).toBe('Tokyo')
    expect(spy.mock.calls[0][1]?.method).toBe('POST')
  })

  it('addPlaceToTrip calls POST /trips/:id/places', async () => {
    const spy = mockFetch({ data: null }, 201)
    const client = makeClient()
    await client.addPlaceToTrip('trip-1', 'place-1', 0)
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/trips/trip-1/places`)
    const body = JSON.parse(spy.mock.calls[0][1]?.body as string)
    expect(body.placeId).toBe('place-1')
    expect(body.orderIndex).toBe(0)
  })

  it('importTrip calls POST /trips/import', async () => {
    const trip = { id: 't2', name: 'Osaka', userId: 'u1', createdAt: '', updatedAt: '' }
    const spy = mockFetch({ data: trip }, 201)
    const client = makeClient()
    const payload = { version: '1.0' as const, exportedAt: '', name: 'Osaka', places: [] }
    const result = await client.importTrip(payload)
    expect(result.name).toBe('Osaka')
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/trips/import`)
    expect(spy.mock.calls[0][1]?.method).toBe('POST')
  })
})

describe('ApiClient — import/export', () => {
  it('exportAll calls GET /export', async () => {
    const spy = mockFetch({ data: { version: '1.0', exportedAt: '', name: 'Places', places: [] } })
    const client = makeClient()
    await client.exportAll()
    expect(spy.mock.calls[0][0]).toBe(`${BASE_URL}/export`)
  })
})
