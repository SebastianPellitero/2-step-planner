import { createLocationProvider } from '@holiday-planner/shared'

// Only this file knows we're using Google Maps.
// To swap providers, change createLocationProvider in packages/shared/src/services/location/index.ts.
export const locationProvider = createLocationProvider(
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? ''
)
