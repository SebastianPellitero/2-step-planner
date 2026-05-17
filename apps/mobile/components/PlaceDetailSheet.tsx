import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import type { Place } from '@holiday-planner/shared'
import { CATEGORY, FALLBACK } from './PlaceMarker'

const TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant', MUSEUM: 'Museum', HIKE: 'Hike',
  HOTEL: 'Hotel', NATURE: 'Nature', TEMPLE: 'Temple',
  BEACH: 'Beach', MARKET: 'Market', BAR: 'Bar', SHOP: 'Shop', OTHER: 'Other',
}

interface Props {
  place: Place
  onClose: () => void
  onToggleVisited: (place: Place) => void
  isUpdating: boolean
}

export function PlaceDetailSheet({ place, onClose, onToggleVisited, isUpdating }: Props) {
  const { emoji, color } = CATEGORY[place.type] ?? FALLBACK
  const typeLabel = TYPE_LABELS[place.type] ?? place.type

  return (
    <View style={s.sheet}>
      <View style={s.header}>
        <View style={s.typeRow}>
          <View style={[s.badge, { backgroundColor: color }]}>
            <Text style={s.badgeEmoji}>{emoji}</Text>
          </View>
          <Text style={s.typeLabel}>{typeLabel}</Text>
        </View>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={s.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.name}>{place.name}</Text>
      {place.address && <Text style={s.meta}>{place.address}</Text>}
      {place.notes && <Text style={s.notes}>{place.notes}</Text>}

      <TouchableOpacity
        style={[s.visitedBtn, place.visited && s.visitedBtnActive]}
        onPress={() => onToggleVisited(place)}
        disabled={isUpdating}
        activeOpacity={0.8}
      >
        <Text style={[s.visitedBtnText, place.visited && s.visitedBtnTextActive]}>
          {place.visited ? '✓ Visited' : 'Mark as visited'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmoji: {
    fontSize: 14,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  closeBtn: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '600',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
    lineHeight: 22,
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  visitedBtn: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  visitedBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  visitedBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  visitedBtnTextActive: {
    color: '#16a34a',
  },
})
