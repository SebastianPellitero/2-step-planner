import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Place } from '@holiday-planner/shared'
import { CATEGORY, FALLBACK } from './PlaceMarker'

export interface PlaceWithDistance extends Place {
  distanceKm: number
}

interface Props {
  places: PlaceWithDistance[]
  selectedId?: string | null
  onPress: (place: PlaceWithDistance) => void
}

export function NearbyStrip({ places, selectedId, onPress }: Props) {
  if (places.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <Text style={s.emptyText}>No saved places within 2 km</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={places}
      keyExtractor={(p) => p.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.list}
      renderItem={({ item }) => {
        const { emoji, color } = CATEGORY[item.type] ?? FALLBACK
        const selected = item.id === selectedId
        return (
          <TouchableOpacity
            style={[s.card, selected && { borderColor: color, borderWidth: 2 }]}
            onPress={() => onPress(item)}
            activeOpacity={0.8}
          >
            <View style={[s.iconBadge, { backgroundColor: color }]}>
              <Text style={s.iconEmoji}>{emoji}</Text>
            </View>
            <Text style={s.name} numberOfLines={2}>{item.name}</Text>
            <Text style={s.distance}>{item.distanceKm < 1
              ? `${Math.round(item.distanceKm * 1000)} m`
              : `${item.distanceKm.toFixed(1)} km`}
            </Text>
            {item.visited && (
              <View style={s.visitedBadge}>
                <Text style={s.visitedText}>✓ visited</Text>
              </View>
            )}
          </TouchableOpacity>
        )
      }}
    />
  )
}

const s = StyleSheet.create({
  list: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  card: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconEmoji: {
    fontSize: 20,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 4,
  },
  distance: {
    fontSize: 11,
    color: '#6b7280',
  },
  visitedBadge: {
    marginTop: 4,
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  visitedText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600',
  },
  emptyContainer: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#9ca3af',
  },
})
