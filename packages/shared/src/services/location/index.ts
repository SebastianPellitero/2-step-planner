// Public surface — the rest of the app only touches these exports.
// To swap providers: add a new implementation and change the import below.

export type { LocationResult, LocationSearchProvider, SearchOptions } from './types'
export { GoogleMapsProvider } from './google'

/**
 * Factory — returns the active location provider.
 * Pass the API key from the app's environment.
 *
 * @example
 * // apps/mobile/lib/location.ts
 * export const locationProvider = createLocationProvider(process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY!)
 */
export function createLocationProvider(apiKey: string): import('./types').LocationSearchProvider {
  const { GoogleMapsProvider } = require('./google') as typeof import('./google')
  return new GoogleMapsProvider(apiKey)
}
