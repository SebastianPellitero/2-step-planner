'use client'

import { useState, useRef, useEffect } from 'react'
import type { Trip } from '@holiday-planner/shared'

interface Props {
  trips: Trip[]
  selectedTripId: string | null
  onSelect: (tripId: string | null) => void
}

export function WishlistSelector({ trips, selectedTripId, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selectedTrip = trips.find((t) => t.id === selectedTripId)
  const label = selectedTrip ? selectedTrip.name : 'All places'

  function handleSelect(tripId: string | null) {
    onSelect(tripId)
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={s.wrapper}>
      <button style={s.pill} onClick={() => setOpen((o) => !o)}>
        <span style={s.icon}>🗂</span>
        <span style={s.label}>{label}</span>
        <span style={{ ...s.chevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
      </button>

      {open && (
        <div style={s.dropdown}>
          <button
            style={{ ...s.option, ...(selectedTripId === null ? s.optionSelected : {}) }}
            onClick={() => handleSelect(null)}
          >
            All places
          </button>
          {trips.map((trip) => (
            <button
              key={trip.id}
              style={{ ...s.option, ...(selectedTripId === trip.id ? s.optionSelected : {}) }}
              onClick={() => handleSelect(trip.id)}
            >
              {trip.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    zIndex: 10,
  },
  pill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#fff',
    border: 'none',
    borderRadius: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  icon: { fontSize: '1rem' },
  label: { maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  chevron: { fontSize: '0.75rem', transition: 'transform 0.15s', color: 'var(--color-muted)' },
  dropdown: {
    marginTop: '6px',
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    minWidth: '180px',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  option: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '10px 16px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--color-text)',
  },
  optionSelected: {
    background: '#eff6ff',
    color: 'var(--color-primary)',
    fontWeight: 700,
  },
}
