'use client'

import { useState } from 'react'
import { DISCOVER_LISTS, type DiscoverList } from '@/lib/discoverLists'
import { AddToTripModal } from '@/components/discover/AddToTripModal'
import { getCategoryConfig } from '@/lib/categories'

export default function DiscoverPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingList, setAddingList] = useState<DiscoverList | null>(null)

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Discover</h1>
        <p style={s.sub}>Curated place lists you can add to your trips</p>
      </div>

      <div style={s.grid}>
        {DISCOVER_LISTS.map((list) => {
          const expanded = expandedId === list.id
          return (
            <div key={list.id} style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardLeft}>
                  <span style={s.listEmoji}>{list.emoji}</span>
                  <div>
                    <div style={s.listTitle}>{list.title}</div>
                    <div style={s.listDesc}>{list.description}</div>
                  </div>
                </div>
                <button
                  style={s.toggleBtn}
                  onClick={() => setExpandedId(expanded ? null : list.id)}
                >
                  {expanded ? 'Hide' : `See ${list.places.length} places`}
                </button>
              </div>

              {expanded && (
                <div style={s.expanded}>
                  <div style={s.placeList}>
                    {list.places.map((place, i) => {
                      const { emoji, color } = getCategoryConfig(place.type)
                      return (
                        <div key={i} style={s.placeRow}>
                          <div style={{ ...s.placeBadge, background: color }}>{emoji}</div>
                          <div style={s.placeInfo}>
                            <div style={s.placeName}>{place.name}</div>
                            {place.address && <div style={s.placeAddr}>{place.address}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <button style={s.addBtn} onClick={() => setAddingList(list)}>
                    Add all to Trip →
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {addingList && (
        <AddToTripModal
          places={addingList.places}
          listTitle={addingList.title}
          onClose={() => setAddingList(null)}
        />
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '800px' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111' },
  sub: { fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: '0.25rem' },
  grid: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: {
    background: '#fff', borderRadius: '16px', border: '1px solid var(--color-border)',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.125rem 1.25rem',
  },
  cardLeft: { display: 'flex', alignItems: 'center', gap: '0.875rem' },
  listEmoji: { fontSize: '2rem', lineHeight: 1 },
  listTitle: { fontSize: '1rem', fontWeight: 700, color: '#111' },
  listDesc: { fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '0.15rem' },
  toggleBtn: {
    background: 'transparent', border: '1.5px solid var(--color-primary)',
    color: 'var(--color-primary)', borderRadius: '20px',
    padding: '0.375rem 1rem', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  expanded: {
    borderTop: '1px solid var(--color-border)',
    padding: '0.75rem 1.25rem 1.25rem',
  },
  placeList: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  placeRow: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  placeBadge: {
    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px',
  },
  placeInfo: { flex: 1 },
  placeName: { fontSize: '0.875rem', fontWeight: 600, color: '#111' },
  placeAddr: { fontSize: '0.75rem', color: 'var(--color-muted)' },
  addBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '20px', padding: '0.5rem 1.25rem', fontWeight: 700,
    fontSize: '0.875rem', cursor: 'pointer',
  },
}
