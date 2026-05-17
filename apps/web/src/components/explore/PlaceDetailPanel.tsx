'use client'

import type { Place } from '@holiday-planner/shared'
import { getCategoryConfig } from '@/lib/categories'
import { useCategoryStore } from '@/store/categories'
import { PLACE_TYPE_LABELS } from '@holiday-planner/shared'

interface Props {
  place: Place
  onClose: () => void
  onToggleVisited: (place: Place) => void
  isUpdating: boolean
}

export function PlaceDetailPanel({ place, onClose, onToggleVisited, isUpdating }: Props) {
  const { customCategories } = useCategoryStore()
  const { emoji, color } = getCategoryConfig(place.type, customCategories)
  const typeLabel = PLACE_TYPE_LABELS[place.type] ?? place.type

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <div style={s.typeRow}>
          <div style={{ ...s.badge, background: color }}>{emoji}</div>
          <span style={s.typeLabel}>{typeLabel}</span>
        </div>
        <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
      </div>

      <div style={s.name}>{place.name}</div>

      {place.address && <div style={s.meta}>{place.address}</div>}
      {place.notes && <div style={s.notes}>{place.notes}</div>}

      <button
        style={{ ...s.visitedBtn, ...(place.visited ? s.visitedBtnActive : {}) }}
        onClick={() => onToggleVisited(place)}
        disabled={isUpdating}
      >
        {place.visited ? '✓ Visited' : 'Mark as visited'}
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  panel: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    right: '12px',
    zIndex: 10,
    background: '#fff',
    borderRadius: '16px',
    padding: '1rem 1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    maxWidth: '420px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  typeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  typeLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: 'var(--color-muted)',
    lineHeight: 1,
    padding: '2px 4px',
    borderRadius: '4px',
  },
  name: {
    fontSize: '1.05rem',
    fontWeight: 700,
    color: '#111',
    marginBottom: '0.25rem',
    lineHeight: 1.3,
  },
  meta: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    marginBottom: '0.25rem',
  },
  notes: {
    fontSize: '0.825rem',
    color: '#374151',
    marginBottom: '0.5rem',
    lineHeight: 1.5,
  },
  visitedBtn: {
    marginTop: '0.625rem',
    width: '100%',
    padding: '0.5rem',
    borderRadius: '10px',
    border: '1.5px solid #d1d5db',
    background: '#f9fafb',
    color: '#374151',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  visitedBtnActive: {
    background: '#dcfce7',
    borderColor: '#86efac',
    color: '#16a34a',
  },
}
