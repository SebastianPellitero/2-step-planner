export interface LocationResult {
  /** Provider's unique ID for this place (e.g. Mapbox feature ID) */
  placeId: string
  /** Short display name, e.g. "Kiyomizu-dera" */
  name: string
  /** Full formatted address, e.g. "294-1 Kiyomizudera, Higashiyama, Kyoto" */
  address: string
  /** City / locality */
  city: string
  /** Country name */
  country: string
  latitude: number
  longitude: number
}

export interface SearchOptions {
  /** Bias results toward this coordinate */
  proximity?: { longitude: number; latitude: number }
  limit?: number
  language?: string
}

export interface LocationSearchProvider {
  search(query: string, options?: SearchOptions): Promise<LocationResult[]>
}
