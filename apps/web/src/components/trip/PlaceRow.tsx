'use client'

import type { Place } from '@holiday-planner/shared'
import { CategoryPill } from '@/components/ui/CategoryPill'
import { useCategoryStore } from '@/store/categories'

interface Props {
  place: Place
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
  onToggleVisited: (place: Place) => void
}

export function PlaceRow({ place, onEdit, onDelete, onToggleVisited }: Props) {
  const { customCategories } = useCategoryStore()

  return (
    <div style={s.row}>
      <button
        style={{ ...s.dot, ...(place.visited ? s.dotDone : {}) }}
        onClick={() => onToggleVisited(place)}
        title={place.visited ? 'Mark unvisited' : 'Mark visited'}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...s.name, ...(place.visited ? s.nameVisited : {}) }}>{place.name}</div>
        <div style={{ marginTop: '4px' }}>
          <CategoryPill type={place.type} customCategories={customCategories} />
        </div>
      </div>
      <div style={s.actions}>
        <button style={s.actionBtn} onClick={() => onEdit(place)} title="Edit">✏️</button>
        <button style={s.actionBtn} onClick={() => onDelete(place)} title="Delete">🗑️</button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff',
    borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '0.4rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  dot: {
    width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
    border: '2px solid #d1d5db', background: 'none', cursor: 'pointer',
  },
  dotDone: { background: '#22c55e', borderColor: '#22c55e' },
  name: { fontSize: '0.9rem', fontWeight: 600, color: '#111' },
  nameVisited: { textDecoration: 'line-through', color: 'var(--color-muted)' },
  actions: { display: 'flex', gap: '0.25rem', flexShrink: 0 },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '4px' },
}
