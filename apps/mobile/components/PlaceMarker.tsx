import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'
import type { Place } from '@holiday-planner/shared'

interface CategoryStyle {
  emoji: string
  color: string
}

const CATEGORY: Record<string, CategoryStyle> = {
  RESTAURANT: { emoji: '🍽️', color: '#ef4444' },
  MUSEUM:     { emoji: '🏛️', color: '#8b5cf6' },
  HIKE:       { emoji: '🥾', color: '#10b981' },
  HOTEL:      { emoji: '🏨', color: '#3b82f6' },
  NATURE:     { emoji: '🌿', color: '#22c55e' },
  TEMPLE:     { emoji: '⛩️', color: '#f97316' },
  BEACH:      { emoji: '🏖️', color: '#06b6d4' },
  MARKET:     { emoji: '🛒', color: '#eab308' },
  BAR:        { emoji: '🍺', color: '#f59e0b' },
  SHOP:       { emoji: '🛍️', color: '#ec4899' },
  OTHER:      { emoji: '📍', color: '#6b7280' },
}

const FALLBACK: CategoryStyle = { emoji: '📍', color: '#6b7280' }

const BASE_SIZE = 36
const MIN_SCALE = 0.05

interface Props {
  place: Place
  selected?: boolean
  scale?: number
  onPress: (place: Place) => void
}

export function PlaceMarker({ place, selected = false, scale = 1, onPress }: Props) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true)

  useEffect(() => {
    setTracksViewChanges(true)
    const t = setTimeout(() => setTracksViewChanges(false), 400)
    return () => clearTimeout(t)
  }, [scale])

  if (place.latitude == null || place.longitude == null) return null
  if (scale < MIN_SCALE) return null

  const { emoji, color } = CATEGORY[place.type] ?? FALLBACK

  const size = Math.round(BASE_SIZE * scale)
  const selectedSize = Math.round(42 * scale)
  const fontSize = Math.round(16 * scale)
  const pinW = Math.round(4 * scale)
  const pinH = Math.round(5 * scale)

  return (
    <Marker
      coordinate={{ latitude: place.latitude, longitude: place.longitude }}
      onPress={() => onPress(place)}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={{ alignItems: 'center', width: selected ? selectedSize : size }}>
        <View style={[
          s.bubble,
          { backgroundColor: color, width: size, height: size, borderRadius: size / 2 },
          selected && { width: selectedSize, height: selectedSize, borderRadius: selectedSize / 2, borderWidth: 2.5, borderColor: '#fff' },
        ]}>
          <Text style={{ fontSize }}>{emoji}</Text>
        </View>
        <View style={[
          s.pin,
          { borderTopColor: color, borderLeftWidth: pinW, borderRightWidth: pinW, borderTopWidth: pinH },
        ]} />
      </View>
    </Marker>
  )
}

export { CATEGORY, FALLBACK }
export type { CategoryStyle }

const s = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 30,
    maxWidth: 30,

  },
  pin: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
})
