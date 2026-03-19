import type { Place } from '@holiday-planner/shared'
import { getCategoryConfig } from '@/lib/categories'
import { PlaceRow } from './PlaceRow'

type GroupMode = 'city' | 'type'

interface Props {
  places: Place[]
  groupMode: GroupMode
  onEdit: (place: Place) => void
  onDelete: (place: Place) => void
  onToggleVisited: (place: Place) => void
}

function groupPlaces(places: Place[], mode: GroupMode) {
  const key = mode === 'city' ? 'city' : 'type'
  const map: Record<string, Place[]> = {}
  for (const p of places) {
    const k = (p[key as keyof Place] as string) || (mode === 'city' ? 'Unknown' : 'OTHER')
    if (!map[k]) map[k] = []
    map[k].push(p)
  }
  return Object.entries(map)
}

export function PlaceList({ places, groupMode, onEdit, onDelete, onToggleVisited }: Props) {
  if (places.length === 0) {
    return <p style={{ color: 'var(--color-muted)', textAlign: 'center', marginTop: '3rem', fontSize: '0.9rem' }}>No places yet. Click &quot;+ Place&quot; to add one.</p>
  }

  const sections = groupPlaces(places, groupMode)

  return (
    <div>
      {sections.map(([title, items]) => (
        <div key={title} style={{ marginBottom: '1.25rem' }}>
          <div style={s.sectionHeader}>
            {groupMode === 'type' ? getCategoryConfig(title).label : `— ${title}`}
          </div>
          {items.map((p) => (
            <PlaceRow
              key={p.id}
              place={p}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisited={onToggleVisited}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  sectionHeader: {
    fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: '0.5rem', marginTop: '0.5rem',
  },
}
