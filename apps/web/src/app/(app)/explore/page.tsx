'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Place, Trip } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { GoogleMap } from '@/components/explore/GoogleMap'
import { NearbyStrip, type PlaceWithDistance } from '@/components/explore/NearbyStrip'
import { LocationBanner } from '@/components/explore/LocationBanner'
import { WishlistSelector } from '@/components/explore/WishlistSelector'
import { PlaceDetailPanel } from '@/components/explore/PlaceDetailPanel'

export default function ExplorePage() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [nearby, setNearby] = useState<PlaceWithDistance[]>([])
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  const { data: tripsData = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
  })

  const { data: placesData = [] } = useQuery({
    queryKey: ['places', selectedTripId],
    queryFn: () => apiClient.getPlaces(selectedTripId ? { tripId: selectedTripId } : undefined),
    refetchOnMount: true,
  })

  const toggleVisited = useMutation({
    mutationFn: (place: Place) => apiClient.updatePlace(place.id, { visited: !place.visited }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places', selectedTripId] }),
  })

  const places = placesData as Place[]
  const trips = tripsData as Trip[]
  const selectedPlace = selectedId ? places.find((p) => p.id === selectedId) ?? null : null

  function handleNearbyChange(next: PlaceWithDistance[]) {
    setNearby(next)
  }

  const showBanner = permissionDenied && !bannerDismissed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showBanner && <LocationBanner onDismiss={() => setBannerDismissed(true)} />}

      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <GoogleMap
          places={places}
          selectedId={selectedId}
          onSelectPlace={(p) => setSelectedId(p.id)}
          onNearbyChange={handleNearbyChange}
          onPermissionDenied={() => setPermissionDenied(true)}
        />
        {trips.length > 0 && (
          <WishlistSelector
            trips={trips}
            selectedTripId={selectedTripId}
            onSelect={setSelectedTripId}
          />
        )}
        {selectedPlace && (
          <PlaceDetailPanel
            place={selectedPlace}
            onClose={() => setSelectedId(null)}
            onToggleVisited={(p) => toggleVisited.mutate(p)}
            isUpdating={toggleVisited.isPending}
          />
        )}
      </div>

      <NearbyStrip
        places={nearby}
        selectedId={selectedId}
        onPress={(p) => setSelectedId(p.id)}
      />
    </div>
  )
}
