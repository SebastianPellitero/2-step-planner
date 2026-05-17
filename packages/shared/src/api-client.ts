import type {
  Place,
  Trip,
  User,
  ExportSchema,
  ApiSuccess,
} from './types'
import type {
  CreatePlaceInput,
  UpdatePlaceInput,
  CreateTripInput,
  UpdateTripInput,
  LoginInput,
  RegisterInput,
  ImportInput,
} from './schemas'

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  setToken(token: string | null) {
    this.token = token
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    })

    const json = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      throw new Error((json.error as string) ?? `Request failed: ${response.status}`)
    }

    return (json as unknown as ApiSuccess<T>).data
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────

  register(input: RegisterInput) {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  login(input: LoginInput) {
    return this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  // ── Places ───────────────────────────────────────────────────────────────────

  getPlaces(params?: { type?: string; tripId?: string; visited?: boolean }) {
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return this.request<Place[]>(`/places${qs}`)
  }

  createPlace(input: CreatePlaceInput) {
    return this.request<Place>('/places', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  updatePlace(id: string, input: UpdatePlaceInput) {
    return this.request<Place>(`/places/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  deletePlace(id: string) {
    return this.request<void>(`/places/${id}`, { method: 'DELETE' })
  }

  // ── Trips ─────────────────────────────────────────────────────────────────────

  getTrips() {
    return this.request<Trip[]>('/trips')
  }

  getTrip(id: string) {
    return this.request<Trip>(`/trips/${id}`)
  }

  createTrip(input: CreateTripInput) {
    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  updateTrip(id: string, input: UpdateTripInput) {
    return this.request<Trip>(`/trips/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  }

  deleteTrip(id: string) {
    return this.request<void>(`/trips/${id}`, { method: 'DELETE' })
  }

  addPlaceToTrip(tripId: string, placeId: string, orderIndex?: number) {
    return this.request<void>(`/trips/${tripId}/places`, {
      method: 'POST',
      body: JSON.stringify({ placeId, orderIndex }),
    })
  }

  removePlaceFromTrip(tripId: string, placeId: string) {
    return this.request<void>(`/trips/${tripId}/places/${placeId}`, {
      method: 'DELETE',
    })
  }

  reorderTripPlaces(tripId: string, order: { placeId: string; orderIndex: number }[]) {
    return this.request<void>(`/trips/${tripId}/places/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ order }),
    })
  }

  // ── Import / Export ───────────────────────────────────────────────────────────

  exportAll() {
    return this.request<ExportSchema>('/export')
  }

  importList(input: ImportInput) {
    return this.request<{ imported: number }>('/import', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }

  importTrip(input: ExportSchema) {
    return this.request<Trip>('/trips/import', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  }
}
