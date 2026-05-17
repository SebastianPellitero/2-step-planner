'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GoogleMap as GMapComponent, useJsApiLoader } from '@react-google-maps/api'
import type { Place } from '@holiday-planner/shared'
import { EmojiMarker } from './EmojiMarker'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GMap = GMapComponent as any

const DEFAULT_CENTER = { lat: 20, lng: 0 }
const DEFAULT_ZOOM = 2
const NEARBY_RADIUS_KM = 2

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

interface Props {
  places: Place[]
  selectedId: string | null
  onSelectPlace: (place: Place) => void
  onNearbyChange: (places: (Place & { distanceKm: number })[]) => void
  onPermissionDenied: () => void
}

export function GoogleMap({ places, selectedId, onSelectPlace, onNearbyChange, onPermissionDenied }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  })

  const mapRef = useRef<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const onPermissionDeniedRef = useRef(onPermissionDenied)
  const onNearbyChangeRef = useRef(onNearbyChange)

  useEffect(() => { onPermissionDeniedRef.current = onPermissionDenied }, [onPermissionDenied])
  useEffect(() => { onNearbyChangeRef.current = onNearbyChange }, [onNearbyChange])

  const mappablePlaces = places
    .map((p) => ({ ...p, latitude: p.latitude ?? p.lat, longitude: p.longitude ?? p.lng }))
    .filter((p) => p.latitude !== 0 || p.longitude !== 0)

  useEffect(() => {
    if (!navigator.geolocation) return
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLocation((prev) => {
          if (!prev) {
            mapRef.current?.panTo(loc)
            mapRef.current?.setZoom(13)
          }
          return loc
        })
      },
      () => onPermissionDeniedRef.current(),
      { enableHighAccuracy: false, timeout: 10000 }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!userLocation) return
    const nearby = mappablePlaces
      .map((p) => ({ ...p, distanceKm: distanceKm(userLocation.lat, userLocation.lng, p.latitude!, p.longitude!) }))
      .filter((p) => p.distanceKm <= NEARBY_RADIUS_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm)
    onNearbyChangeRef.current(nearby)
  }, [userLocation, places])

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  function handleMarkerPress(place: Place) {
    onSelectPlace(place)
    if (place.latitude != null && place.longitude != null) {
      mapRef.current?.panTo({ lat: place.latitude, lng: place.longitude })
      mapRef.current?.setZoom(15)
    }
  }

  if (!isLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
        Loading map…
      </div>
    )
  }

  return (
    <GMap
      onLoad={onLoad}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      mapContainerStyle={{ width: '100%', height: '100%' }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {mappablePlaces.map((place) => (
        <EmojiMarker
          key={place.id}
          place={place}
          selected={place.id === selectedId}
          onPress={handleMarkerPress}
        />
      ))}
    </GMap>
  )
}
