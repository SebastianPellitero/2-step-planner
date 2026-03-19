'use client'

import { OverlayView as OverlayViewComponent } from '@react-google-maps/api'
import type { Place } from '@holiday-planner/shared'
import { getCategoryConfig } from '@/lib/categories'
import { useCategoryStore } from '@/store/categories'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OverlayView = OverlayViewComponent as any

interface Props {
  place: Place
  selected?: boolean
  onPress: (place: Place) => void
}

export function EmojiMarker({ place, selected = false, onPress }: Props) {
  const { customCategories } = useCategoryStore()

  if (place.latitude == null || place.longitude == null) return null

  const { emoji, color } = getCategoryConfig(place.type, customCategories)
  const size = selected ? 42 : 36

  return (
    <OverlayView
      position={{ lat: place.latitude, lng: place.longitude }}
      mapPaneName="overlayMouseTarget"
    >
      <div
        onClick={() => onPress(place)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          transform: 'translate(-50%, -100%)',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.45, boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          border: selected ? '2.5px solid #fff' : 'none',
          transition: 'all 0.15s',
        }}>
          {emoji}
        </div>
        <div style={{
          width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `6px solid ${color}`,
        }} />
      </div>
    </OverlayView>
  )
}
