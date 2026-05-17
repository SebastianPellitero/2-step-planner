import { describe, it, expect } from 'vitest'
import { DISCOVER_LISTS } from '@/lib/discoverLists'

const VALID_TYPES = ['RESTAURANT', 'MUSEUM', 'HIKE', 'HOTEL', 'NATURE', 'TEMPLE', 'BEACH', 'MARKET', 'BAR', 'SHOP', 'OTHER']

describe('DISCOVER_LISTS', () => {
  it('has exactly 4 lists', () => {
    expect(DISCOVER_LISTS).toHaveLength(4)
  })

  it('every list has required fields', () => {
    for (const list of DISCOVER_LISTS) {
      expect(list.id).toBeTruthy()
      expect(list.title).toBeTruthy()
      expect(list.emoji).toBeTruthy()
      expect(list.description).toBeTruthy()
      expect(Array.isArray(list.places)).toBe(true)
    }
  })

  it('list IDs are unique', () => {
    const ids = DISCOVER_LISTS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('Tokyo list has 50 places', () => {
    const tokyo = DISCOVER_LISTS.find((l) => l.id === 'tokyo-restaurants')
    expect(tokyo).toBeDefined()
    expect(tokyo!.places).toHaveLength(50)
  })

  it('Osaka list has 50 places', () => {
    const osaka = DISCOVER_LISTS.find((l) => l.id === 'osaka-restaurants')
    expect(osaka).toBeDefined()
    expect(osaka!.places).toHaveLength(50)
  })

  it('Amsterdam list has 30 places', () => {
    const amsterdam = DISCOVER_LISTS.find((l) => l.id === 'amsterdam-todo')
    expect(amsterdam).toBeDefined()
    expect(amsterdam!.places).toHaveLength(30)
  })

  it('Utrecht list has 20 places', () => {
    const utrecht = DISCOVER_LISTS.find((l) => l.id === 'utrecht-see')
    expect(utrecht).toBeDefined()
    expect(utrecht!.places).toHaveLength(20)
  })

  it('all places have a valid PlaceType', () => {
    for (const list of DISCOVER_LISTS) {
      for (const place of list.places) {
        expect(VALID_TYPES).toContain(place.type)
      }
    }
  })

  it('all places have a non-empty name', () => {
    for (const list of DISCOVER_LISTS) {
      for (const place of list.places) {
        expect(place.name.trim().length).toBeGreaterThan(0)
      }
    }
  })

  it('all places have valid lat/lng ranges', () => {
    for (const list of DISCOVER_LISTS) {
      for (const place of list.places) {
        expect(place.lat).toBeGreaterThanOrEqual(-90)
        expect(place.lat).toBeLessThanOrEqual(90)
        expect(place.lng).toBeGreaterThanOrEqual(-180)
        expect(place.lng).toBeLessThanOrEqual(180)
      }
    }
  })

  it('Tokyo and Osaka places have lat in Japan range', () => {
    const japanLists = DISCOVER_LISTS.filter((l) => l.id.startsWith('tokyo') || l.id.startsWith('osaka'))
    for (const list of japanLists) {
      for (const place of list.places) {
        expect(place.lat).toBeGreaterThan(30)
        expect(place.lat).toBeLessThan(46)
        expect(place.lng).toBeGreaterThan(129)
        expect(place.lng).toBeLessThan(146)
      }
    }
  })

  it('Amsterdam places are in Netherlands latitude range', () => {
    const amsterdam = DISCOVER_LISTS.find((l) => l.id === 'amsterdam-todo')!
    for (const place of amsterdam.places) {
      expect(place.lat).toBeGreaterThan(52)
      expect(place.lat).toBeLessThan(53)
    }
  })

  it('all places have visited set to false by default', () => {
    for (const list of DISCOVER_LISTS) {
      for (const place of list.places) {
        expect(place.visited).toBe(false)
      }
    }
  })

  it('no duplicate place names within the same list', () => {
    for (const list of DISCOVER_LISTS) {
      const names = list.places.map((p) => p.name)
      expect(new Set(names).size).toBe(names.length)
    }
  })
})
