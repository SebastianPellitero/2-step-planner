import { useEffect, useRef, useState } from 'react'
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import MapView, { type Region } from 'react-native-maps'
import * as Location from 'expo-location'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Place, Trip } from '@holiday-planner/shared'
import { apiClient } from '../../lib/api'
import { PlaceMarker } from '../../components/PlaceMarker'
import { NearbyStrip, type PlaceWithDistance } from '../../components/NearbyStrip'
import { PlaceDetailSheet } from '../../components/PlaceDetailSheet'

const NEARBY_RADIUS_KM = 2
const DEFAULT_REGION: Region = {
  latitude: 20,
  longitude: 0,
  latitudeDelta: 60,
  longitudeDelta: 60,
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

export default function ExploreScreen() {
  const queryClient = useQueryClient()
  const mapRef = useRef<MapView>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [latitudeDelta, setLatitudeDelta] = useState(DEFAULT_REGION.latitudeDelta)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // scale: 1 when zoomed in (delta ≤ 0.05), shrinks as you zoom out, hidden below 0.4
  const markerScale = Math.min(1, 0.05 / latitudeDelta)

  const { data: tripsData = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
  })
  const trips = tripsData as Trip[]

  const toggleVisited = useMutation({
    mutationFn: (place: Place) => apiClient.updatePlace(place.id, { visited: !place.visited }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places', selectedTripId] }),
  })

  // Fetch places filtered by selected trip
  const { data: placesData } = useQuery({
    queryKey: ['places', selectedTripId],
    queryFn: () => apiClient.getPlaces(selectedTripId ? { tripId: selectedTripId } : undefined),
    refetchOnMount: true,
  })

  const places: Place[] = (placesData ?? []) as Place[]
  const selectedPlace = selectedId ? places.find((p) => p.id === selectedId) ?? null : null
  const mappablePlaces = places
    .map((p) => ({ ...p, latitude: p.latitude ?? p.lat, longitude: p.longitude ?? p.lng }))
    .filter((p) => p.latitude !== 0 || p.longitude !== 0)

  // Auto-fit map whenever the visible places change (trip selected or initial load)
  useEffect(() => {
    if (mappablePlaces.length === 0) return
    mapRef.current?.fitToCoordinates(
      mappablePlaces.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      { edgePadding: { top: 80, right: 60, bottom: 120, left: 60 }, animated: true }
    )
  }, [placesData])

  // Request & watch location
  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null

    async function startLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setPermissionStatus(status === 'granted' ? 'granted' : 'denied')

      if (status !== 'granted') return

      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const coords = {
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
      }
      setUserLocation(coords)
      mapRef.current?.animateToRegion(
        { ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 },
        800
      )

      watcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Low,
          timeInterval: 30_000,
          distanceInterval: 50,
        },
        (loc) => {
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          })
        }
      )
    }

    startLocation()
    return () => { watcher?.remove() }
  }, [])

  // Nearby places sorted by distance
  const nearbyPlaces: PlaceWithDistance[] = userLocation
    ? (mappablePlaces
        .map((p) => ({
          ...p,
          distanceKm: distanceKm(
            userLocation.latitude,
            userLocation.longitude,
            p.latitude!,
            p.longitude!
          ),
        }))
        .filter((p) => p.distanceKm <= NEARBY_RADIUS_KM)
        .sort((a, b) => a.distanceKm - b.distanceKm) as PlaceWithDistance[])
    : []

  function handleMarkerPress(place: Place) {
    setSelectedId(place.id)
    if (place.latitude != null && place.longitude != null) {
      mapRef.current?.animateToRegion(
        {
          latitude: place.latitude,
          longitude: place.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400
      )
    }
  }

  const showBanner = permissionStatus === 'denied' && !bannerDismissed

  return (
    <View style={s.container}>
      {showBanner && (
        <View style={s.banner}>
          <Text style={s.bannerText}>
            📍 Enable location to center the map and see nearby places
          </Text>
          <View style={s.bannerActions}>
            <TouchableOpacity onPress={() => Linking.openSettings()}>
              <Text style={s.bannerLink}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBannerDismissed(true)}>
              <Text style={s.bannerDismiss}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={s.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionStatus === 'granted'}
        showsMyLocationButton={Platform.OS === 'android'}
        mapType="standard"
        onRegionChangeComplete={(r) => setLatitudeDelta(r.latitudeDelta)}
      >
        {mappablePlaces.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            selected={place.id === selectedId}
            scale={markerScale}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>

      {trips.length > 0 && (
        <View style={s.selectorWrapper} pointerEvents="box-none">
          <TouchableOpacity
            style={s.pill}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.85}
          >
            <Text style={s.pillText}>
              🗂 {selectedTripId ? (trips.find((t) => t.id === selectedTripId)?.name ?? 'Wishlist') : 'All places'}{'  ▾'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={dropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropdownOpen(false)}
      >
        <Pressable style={s.modalBackdrop} onPress={() => setDropdownOpen(false)}>
          <View style={s.dropdownCard} onStartShouldSetResponder={() => true}>
            <Text style={s.dropdownTitle}>Show on map</Text>
            <ScrollView bounces={false}>
              <TouchableOpacity
                style={[s.dropdownRow, selectedTripId === null && s.dropdownRowSelected]}
                onPress={() => { setSelectedTripId(null); setDropdownOpen(false) }}
              >
                <Text style={[s.dropdownRowText, selectedTripId === null && s.dropdownRowTextSelected]}>
                  All places
                </Text>
                {selectedTripId === null && <Text style={s.check}>✓</Text>}
              </TouchableOpacity>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={[s.dropdownRow, selectedTripId === trip.id && s.dropdownRowSelected]}
                  onPress={() => { setSelectedTripId(trip.id); setDropdownOpen(false) }}
                >
                  <Text style={[s.dropdownRowText, selectedTripId === trip.id && s.dropdownRowTextSelected]}>
                    {trip.name}
                  </Text>
                  {selectedTripId === trip.id && <Text style={s.check}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {selectedPlace && (
        <PlaceDetailSheet
          place={selectedPlace}
          onClose={() => setSelectedId(null)}
          onToggleVisited={(p) => toggleVisited.mutate(p)}
          isUpdating={toggleVisited.isPending}
        />
      )}

      {!selectedPlace && userLocation && (
        <View style={s.strip}>
          <Text style={s.stripHeader}>Nearby</Text>
          <NearbyStrip
            places={nearbyPlaces}
            selectedId={selectedId}
            onPress={(p) => handleMarkerPress(p)}
          />
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#1e40af',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bannerText: {
    color: '#fff',
    fontSize: 13,
    flex: 1,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerLink: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerDismiss: {
    color: '#93c5fd',
    fontSize: 16,
  },
  strip: {
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 4,
    paddingBottom: 8,
  },
  stripHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  selectorWrapper: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 10,
  },
  pill: {
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dropdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxHeight: 320,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dropdownRowSelected: {
    backgroundColor: '#eff6ff',
  },
  dropdownRowText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  dropdownRowTextSelected: {
    color: '#2563eb',
    fontWeight: '700',
  },
  check: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '700',
  },
})
