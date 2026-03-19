import { createLocationProvider } from '@holiday-planner/shared'

export const locationProvider = createLocationProvider(
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
)
