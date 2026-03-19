'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Place } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { GoogleMap } from '@/components/explore/GoogleMap'
import { NearbyStrip, type PlaceWithDistance } from '@/components/explore/NearbyStrip'
import { LocationBanner } from '@/components/explore/LocationBanner'

export default function ExplorePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nearby, setNearby] = useState<PlaceWithDistance[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const { data: placesData = [] } = useQuery({
    queryKey: ['places'],
    queryFn: () => apiClient.getPlaces(),
    refetchOnMount: true,
  })

  const places = placesData as Place[]

  function handleNearbyChange(next: PlaceWithDistance[]) {
    setNearby(next)
  }

  const showBanner = permissionDenied && !bannerDismissed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showBanner && <LocationBanner onDismiss={() => setBannerDismissed(true)} />}

      <div style={{ flex: 1, minHeight: 0 }}>
        <GoogleMap
          places={places}
          selectedId={selectedId}
          onSelectPlace={(p) => setSelectedId(p.id)}
          onNearbyChange={handleNearbyChange}
          onPermissionDenied={() => setPermissionDenied(true)}
        />
      </div>

      <NearbyStrip
        places={nearby}
        selectedId={selectedId}
        onPress={(p) => setSelectedId(p.id)}
      />
    </div>
  )
}
