import type { LocationResult, LocationSearchProvider, SearchOptions } from './types'

const GEOCODING_BASE = 'https://maps.googleapis.com/maps/api/geocode/json'

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

interface GoogleResult {
  place_id: string
  formatted_address: string
  geometry: { location: { lat: number; lng: number } }
  address_components: AddressComponent[]
}

interface GoogleResponse {
  results: GoogleResult[]
  status: string
}

function getComponent(components: AddressComponent[], type: string): string {
  return components.find((c) => c.types.includes(type))?.long_name ?? ''
}

export class GoogleMapsProvider implements LocationSearchProvider {
  constructor(private readonly apiKey: string) {}

  async search(query: string, options?: SearchOptions): Promise<LocationResult[]> {
    const trimmed = query.trim()
    if (!trimmed) return []

    const params = new URLSearchParams({
      address:  trimmed,
      key:      this.apiKey,
      language: options?.language ?? 'en',
    })

    if (options?.proximity) {
      const { latitude: lat, longitude: lng } = options.proximity
      // Soft-bias results toward this bounding box (doesn't hard-restrict results)
      params.set('bounds', `${lat - 0.5},${lng - 0.5}|${lat + 0.5},${lng + 0.5}`)
    }

    const res = await fetch(`${GEOCODING_BASE}?${params}`)

    if (!res.ok) {
      throw new Error(`Google Maps geocoding failed: ${res.status} ${res.statusText}`)
    }

    const data = (await res.json()) as GoogleResponse

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Maps API error: ${data.status}`)
    }

    return data.results.slice(0, options?.limit ?? 5).map((r) => {
      // Use establishment/POI name when available, otherwise first segment of formatted address
      const establishment = r.address_components.find((c) =>
        c.types.some((t) => ['establishment', 'point_of_interest'].includes(t))
      )
      const name = establishment?.long_name ?? r.formatted_address.split(',')[0].trim()

      return {
        placeId:   r.place_id,
        name,
        address:   r.formatted_address,
        city:
          getComponent(r.address_components, 'locality') ||
          getComponent(r.address_components, 'administrative_area_level_2') ||
          getComponent(r.address_components, 'administrative_area_level_1'),
        country:   getComponent(r.address_components, 'country'),
        latitude:  r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      }
    })
  }
}
