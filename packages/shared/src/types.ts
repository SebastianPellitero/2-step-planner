export type PlaceType =
  | 'RESTAURANT'
  | 'MUSEUM'
  | 'HIKE'
  | 'HOTEL'
  | 'NATURE'
  | 'TEMPLE'
  | 'BEACH'
  | 'MARKET'
  | 'BAR'
  | 'SHOP'
  | 'OTHER'

export const PLACE_TYPE_LABELS: Record<PlaceType, string> = {
  RESTAURANT: 'Restaurant',
  MUSEUM: 'Museum',
  HIKE: 'Hike',
  HOTEL: 'Hotel',
  NATURE: 'Nature',
  TEMPLE: 'Temple',
  BEACH: 'Beach',
  MARKET: 'Market',
  BAR: 'Bar',
  SHOP: 'Shop',
  OTHER: 'Other',
}

export interface User {
  id: string
  email: string
  createdAt: string
}

export interface Place {
  id: string
  userId: string
  name: string
  description?: string | null
  lat: number
  lng: number
  address?: string | null
  type: PlaceType
  notes?: string | null
  visited: boolean
  createdAt: string
  updatedAt: string
  trips?: PlaceInTrip[]
}

export interface Trip {
  id: string
  userId: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt: string
  places?: PlaceInTrip[]
}

export interface PlaceInTrip {
  placeId: string
  tripId: string
  orderIndex: number
  place?: Place
  trip?: Trip
}

// ── Export / Import ────────────────────────────────────────────────────────────

export interface ExportPlace {
  name: string
  description?: string | null
  lat: number
  lng: number
  address?: string | null
  type: PlaceType
  notes?: string | null
  visited?: boolean
}

export interface ExportSchema {
  version: '1.0'
  exportedAt: string
  name: string
  places: ExportPlace[]
}

// ── API Response wrappers ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
