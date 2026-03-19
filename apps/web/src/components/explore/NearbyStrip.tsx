'use client'

import type { Place } from '@holiday-planner/shared'
import { getCategoryConfig } from '@/lib/categories'
import { useCategoryStore } from '@/store/categories'

export interface PlaceWithDistance extends Place {
  distanceKm: number
}

interface Props {
  places: PlaceWithDistance[]
  selectedId: string | null
  onPress: (place: PlaceWithDistance) => void
}

function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

export function NearbyStrip({ places, selectedId, onPress }: Props) {
  const { customCategories } = useCategoryStore()

  return (
    <div style={s.wrap}>
      <div style={s.header}>Nearby</div>
      <div style={s.scroll}>
        {places.length === 0 ? (
          <span style={s.empty}>No saved places within 2 km</span>
        ) : (
          places.map((p) => {
            const { emoji, color } = getCategoryConfig(p.type, customCategories)
            const selected = p.id === selectedId
            return (
              <button
                key={p.id}
                onClick={() => onPress(p)}
                style={{ ...s.card, ...(selected ? { borderColor: color } : {}) }}
              >
                <div style={{ ...s.badge, background: color }}>{emoji}</div>
                <div style={s.name}>{p.name}</div>
                <div style={s.dist}>{formatDist(p.distanceKm)}</div>
                {p.visited && <div style={s.visited}>✓</div>}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: { background: '#f9fafb', borderTop: '1px solid var(--color-border)', padding: '0.25rem 0 0.5rem' },
  header: {
    fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.4rem 1rem 0.25rem',
  },
  scroll: { display: 'flex', overflowX: 'auto', gap: '0.75rem', padding: '0.25rem 1rem 0.25rem' },
  empty: { fontSize: '0.8rem', color: 'var(--color-muted)', paddingTop: '0.5rem' },
  card: {
    flexShrink: 0, width: '110px', background: '#fff', borderRadius: '12px',
    border: '2px solid transparent', padding: '0.625rem', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  badge: {
    width: '36px', height: '36px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
  },
  name: { fontSize: '0.75rem', fontWeight: 600, color: '#111', textAlign: 'center', lineHeight: 1.2 },
  dist: { fontSize: '0.7rem', color: 'var(--color-muted)' },
  visited: { fontSize: '0.65rem', color: '#22c55e', fontWeight: 700 },
}
