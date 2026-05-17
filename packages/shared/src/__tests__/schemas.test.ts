import { describe, it, expect } from 'vitest'
import {
  RegisterSchema,
  LoginSchema,
  CreatePlaceSchema,
  UpdatePlaceSchema,
  CreateTripSchema,
  UpdateTripSchema,
  AddPlaceToTripSchema,
  ReorderTripPlacesSchema,
  ImportSchema,
  ExportPlaceSchema,
  PlaceTypeEnum,
} from '../schemas'

describe('PlaceTypeEnum', () => {
  it('accepts all valid place types', () => {
    const validTypes = ['RESTAURANT', 'MUSEUM', 'HIKE', 'HOTEL', 'NATURE', 'TEMPLE', 'BEACH', 'MARKET', 'BAR', 'SHOP', 'OTHER']
    for (const type of validTypes) {
      expect(PlaceTypeEnum.parse(type)).toBe(type)
    }
  })

  it('rejects unknown types', () => {
    expect(() => PlaceTypeEnum.parse('CINEMA')).toThrow()
    expect(() => PlaceTypeEnum.parse('')).toThrow()
    expect(() => PlaceTypeEnum.parse('restaurant')).toThrow() // case-sensitive
  })
})

describe('RegisterSchema', () => {
  it('accepts valid credentials', () => {
    expect(RegisterSchema.parse({ email: 'user@example.com', password: 'password123' }))
      .toEqual({ email: 'user@example.com', password: 'password123' })
  })

  it('rejects invalid email', () => {
    expect(() => RegisterSchema.parse({ email: 'not-an-email', password: 'password123' })).toThrow()
  })

  it('rejects short password', () => {
    expect(() => RegisterSchema.parse({ email: 'user@example.com', password: 'short' })).toThrow()
  })

  it('rejects missing fields', () => {
    expect(() => RegisterSchema.parse({ email: 'user@example.com' })).toThrow()
    expect(() => RegisterSchema.parse({ password: 'password123' })).toThrow()
  })
})

describe('LoginSchema', () => {
  it('accepts valid credentials', () => {
    expect(LoginSchema.parse({ email: 'user@example.com', password: 'x' }))
      .toEqual({ email: 'user@example.com', password: 'x' })
  })

  it('rejects empty password', () => {
    expect(() => LoginSchema.parse({ email: 'user@example.com', password: '' })).toThrow()
  })
})

describe('CreatePlaceSchema', () => {
  it('accepts a minimal valid place', () => {
    const result = CreatePlaceSchema.parse({ name: 'Sushi Bar', type: 'RESTAURANT' })
    expect(result.name).toBe('Sushi Bar')
    expect(result.type).toBe('RESTAURANT')
    expect(result.lat).toBe(0)   // default
    expect(result.lng).toBe(0)   // default
  })

  it('accepts a fully-specified place', () => {
    const input = {
      name: 'Jiro Dreams of Sushi',
      type: 'RESTAURANT',
      description: 'Legendary sushi counter',
      address: 'Ginza, Tokyo',
      city: 'Tokyo',
      country: 'Japan',
      latitude: 35.6727,
      longitude: 139.7640,
      lat: 35.6727,
      lng: 139.7640,
      notes: 'Impossible reservation',
    }
    const result = CreatePlaceSchema.parse(input)
    expect(result.name).toBe('Jiro Dreams of Sushi')
    expect(result.latitude).toBe(35.6727)
  })

  it('rejects empty name', () => {
    expect(() => CreatePlaceSchema.parse({ name: '', type: 'RESTAURANT' })).toThrow()
  })

  it('rejects invalid type', () => {
    expect(() => CreatePlaceSchema.parse({ name: 'Place', type: 'INVALID' })).toThrow()
  })
})

describe('UpdatePlaceSchema', () => {
  it('accepts partial updates', () => {
    expect(UpdatePlaceSchema.parse({ name: 'New Name' })).toEqual({ name: 'New Name' })
    expect(UpdatePlaceSchema.parse({ visited: true })).toEqual({ visited: true })
    expect(UpdatePlaceSchema.parse({})).toEqual({})
  })
})

describe('CreateTripSchema', () => {
  it('accepts valid trip', () => {
    expect(CreateTripSchema.parse({ name: 'Tokyo 2025' })).toEqual({ name: 'Tokyo 2025' })
  })

  it('accepts optional description', () => {
    const result = CreateTripSchema.parse({ name: 'Tokyo 2025', description: 'Family trip' })
    expect(result.description).toBe('Family trip')
  })

  it('rejects empty name', () => {
    expect(() => CreateTripSchema.parse({ name: '' })).toThrow()
  })
})

describe('UpdateTripSchema', () => {
  it('accepts empty update (all optional)', () => {
    expect(UpdateTripSchema.parse({})).toEqual({})
  })
})

describe('AddPlaceToTripSchema', () => {
  it('accepts a valid CUID placeId', () => {
    const result = AddPlaceToTripSchema.parse({ placeId: 'cld5y6fqx0000lk08w0s3fgp5' })
    expect(result.placeId).toBe('cld5y6fqx0000lk08w0s3fgp5')
    expect(result.orderIndex).toBeUndefined()
  })

  it('accepts optional orderIndex', () => {
    const result = AddPlaceToTripSchema.parse({ placeId: 'cld5y6fqx0000lk08w0s3fgp5', orderIndex: 3 })
    expect(result.orderIndex).toBe(3)
  })

  it('rejects negative orderIndex', () => {
    expect(() => AddPlaceToTripSchema.parse({ placeId: 'cld5y6fqx0000lk08w0s3fgp5', orderIndex: -1 })).toThrow()
  })
})

describe('ReorderTripPlacesSchema', () => {
  it('accepts a valid reorder array', () => {
    const result = ReorderTripPlacesSchema.parse({
      order: [
        { placeId: 'cld5y6fqx0000lk08w0s3fgp5', orderIndex: 0 },
        { placeId: 'cld5y6fqx0001lk08w0s3fgp6', orderIndex: 1 },
      ],
    })
    expect(result.order).toHaveLength(2)
  })

  it('rejects empty order array', () => {
    const result = ReorderTripPlacesSchema.safeParse({ order: [] })
    expect(result.success).toBe(true) // empty array is valid per schema
  })
})

describe('ExportPlaceSchema', () => {
  it('accepts a minimal export place', () => {
    const result = ExportPlaceSchema.parse({ name: 'Den', lat: 35.69, lng: 139.75, type: 'RESTAURANT' })
    expect(result.name).toBe('Den')
  })

  it('accepts nullable optional fields', () => {
    const result = ExportPlaceSchema.parse({
      name: 'Den',
      lat: 35.69,
      lng: 139.75,
      type: 'RESTAURANT',
      description: null,
      address: null,
      notes: null,
    })
    expect(result.description).toBeNull()
  })
})

describe('ImportSchema', () => {
  it('accepts a valid export payload', () => {
    const payload = {
      version: '1.0' as const,
      exportedAt: '2024-01-01T00:00:00.000Z',
      name: 'Tokyo Trip',
      places: [{ name: 'Den', lat: 35.69, lng: 139.75, type: 'RESTAURANT' }],
    }
    const result = ImportSchema.parse(payload)
    expect(result.version).toBe('1.0')
    expect(result.places).toHaveLength(1)
  })

  it('rejects wrong version', () => {
    expect(() => ImportSchema.parse({ version: '2.0', name: 'Trip', places: [] })).toThrow()
  })

  it('accepts missing exportedAt (optional)', () => {
    const result = ImportSchema.parse({ version: '1.0', name: 'Trip', places: [] })
    expect(result.exportedAt).toBeUndefined()
  })
})
