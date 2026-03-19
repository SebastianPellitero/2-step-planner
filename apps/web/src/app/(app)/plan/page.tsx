'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Trip } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { TripCard } from '@/components/plan/TripCard'
import { NewTripModal } from '@/components/plan/NewTripModal'
import { EditTripModal } from '@/components/plan/EditTripModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function PlanPage() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)
  const [deleting, setDeleting] = useState<Trip | null>(null)

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
  })

  const createTrip = useMutation({
    mutationFn: (name: string) => apiClient.createTrip({ name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setShowNew(false) },
  })

  const updateTrip = useMutation({
    mutationFn: ({ id, name, description }: { id: string; name: string; description: string }) =>
      apiClient.updateTrip(id, { name, description: description || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setEditing(null) },
  })

  const deleteTrip = useMutation({
    mutationFn: (id: string) => apiClient.deleteTrip(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setDeleting(null) },
  })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Wishlist</h1>
          <p style={s.sub}>Places to go</p>
        </div>
        <button style={s.newBtn} onClick={() => setShowNew(true)}>+ Trip</button>
      </div>

      {isLoading ? (
        <div style={s.loading}>Loading…</div>
      ) : (trips as Trip[]).length === 0 ? (
        <div style={s.empty}>No trips yet. Click &quot;+ Trip&quot; to create one.</div>
      ) : (
        <div style={s.grid}>
          {(trips as Trip[]).map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {showNew && (
        <NewTripModal
          onSave={(name) => createTrip.mutate(name)}
          onClose={() => setShowNew(false)}
          loading={createTrip.isPending}
        />
      )}
      {editing && (
        <EditTripModal
          trip={editing}
          onSave={(name, description) => updateTrip.mutate({ id: editing.id, name, description })}
          onClose={() => setEditing(null)}
          loading={updateTrip.isPending}
        />
      )}
      {deleting && (
        <ConfirmDialog
          message={`Delete "${deleting.name}"? This will remove all its places too.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => deleteTrip.mutate(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '1000px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111' },
  sub: { fontSize: '0.9rem', color: 'var(--color-muted)', marginTop: '0.25rem' },
  newBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '20px', padding: '0.5rem 1.25rem', fontWeight: 700,
    fontSize: '0.875rem', cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem',
  },
  loading: { color: 'var(--color-muted)', marginTop: '3rem', textAlign: 'center' },
  empty: { color: 'var(--color-muted)', marginTop: '3rem', textAlign: 'center', fontSize: '0.9rem' },
}
