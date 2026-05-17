'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Trip } from '@holiday-planner/shared'
import { tripEmoji } from '@/lib/categories'

interface Props {
  trip: Trip
  onEdit: (trip: Trip) => void
  onDelete: (trip: Trip) => void
  onExport: (trip: Trip) => void
}

export function TripCard({ trip, onEdit, onDelete, onExport }: Props) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div style={s.card}>
      <div
        style={{ flex: 1, cursor: 'pointer' }}
        onClick={() => router.push(`/plan/${trip.id}`)}
      >
        <div style={s.emoji}>{tripEmoji(trip.id)}</div>
        <div style={s.name}>{trip.name}</div>
        {trip.description && (
          <div style={s.desc}>{trip.description}</div>
        )}
      </div>

      <div ref={menuRef} style={{ position: 'relative', alignSelf: 'flex-start' }}>
        <button
          style={s.menuBtn}
          onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o) }}
        >
          ···
        </button>
        {menuOpen && (
          <div style={s.menu}>
            <button style={s.menuItem} onClick={() => { setMenuOpen(false); onEdit(trip) }}>
              ✏️ Edit
            </button>
            <button style={s.menuItem} onClick={() => { setMenuOpen(false); onExport(trip) }}>
              📤 Export
            </button>
            <button style={{ ...s.menuItem, color: '#ef4444' }} onClick={() => { setMenuOpen(false); onDelete(trip) }}>
              🗑️ Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: '#fff', borderRadius: '16px', padding: '1.25rem',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)', display: 'flex',
    flexDirection: 'column', minHeight: '140px',
    border: '1px solid var(--color-border)',
  },
  emoji: { fontSize: '2.25rem', marginBottom: '0.5rem' },
  name: { fontSize: '1.05rem', fontWeight: 700, color: '#111', marginBottom: '0.25rem' },
  desc: { fontSize: '0.8rem', color: 'var(--color-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
  menuBtn: {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
    color: 'var(--color-muted)', padding: '2px 6px', borderRadius: '6px',
    letterSpacing: '0.1em',
  },
  menu: {
    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
    background: '#fff', border: '1px solid var(--color-border)',
    borderRadius: '10px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    zIndex: 50, minWidth: '130px', overflow: 'hidden',
  },
  menuItem: {
    display: 'block', width: '100%', background: 'none', border: 'none',
    textAlign: 'left', padding: '0.6rem 1rem', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 500,
  },
}
