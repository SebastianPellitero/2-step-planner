'use client'

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Trip, ExportSchema } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { TripCard } from '@/components/plan/TripCard'
import { NewTripModal } from '@/components/plan/NewTripModal'
import { EditTripModal } from '@/components/plan/EditTripModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function PlanPage() {
  const queryClient = useQueryClient()
  const { token } = useAuthStore()
  const [showNew, setShowNew] = useState(false)
  const [editing, setEditing] = useState<Trip | null>(null)
  const [deleting, setDeleting] = useState<Trip | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
    enabled: !!token,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      queryClient.invalidateQueries({ queryKey: ['places'] })
      setDeleting(null)
    },
  })

  const importTrip = useMutation({
    mutationFn: (data: ExportSchema) => apiClient.importTrip(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['trips'] }); setImportError(null) },
    onError: (err: Error) => setImportError(err.message),
  })

  function handleExport(trip: Trip) {
    const places = (trip.places ?? []).map((pit) => {
      const p = pit.place!
      return { name: p.name, description: p.description, lat: p.lat, lng: p.lng, address: p.address, type: p.type, notes: p.notes, visited: p.visited }
    })
    const payload: ExportSchema = { version: '1.0', exportedAt: new Date().toISOString(), name: trip.name, places }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${trip.name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    file.text().then((text) => {
      let parsed: unknown
      try { parsed = JSON.parse(text) } catch { setImportError('Invalid JSON file'); return }
      if (!parsed || typeof parsed !== 'object' || (parsed as ExportSchema).version !== '1.0') {
        setImportError('Not a valid trip export file')
        return
      }
      importTrip.mutate(parsed as ExportSchema)
    })
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Wishlist</h1>
          <p style={s.sub}>Places to go</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="file" accept=".json" ref={fileInputRef} onChange={handleImportFile} style={{ display: 'none' }} />
          <button style={s.importBtn} onClick={() => fileInputRef.current?.click()} disabled={importTrip.isPending}>
            {importTrip.isPending ? 'Importing…' : '⬆ Import'}
          </button>
          <button style={s.newBtn} onClick={() => setShowNew(true)}>+ Trip</button>
        </div>
      </div>
      {importError && (
        <div style={s.importError}>
          {importError}
          <button onClick={() => setImportError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '0.5rem', color: 'inherit' }}>✕</button>
        </div>
      )}

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
              onExport={handleExport}
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
  importBtn: {
    background: 'transparent', color: 'var(--color-primary)', border: '1.5px solid var(--color-primary)',
    borderRadius: '20px', padding: '0.5rem 1.25rem', fontWeight: 700,
    fontSize: '0.875rem', cursor: 'pointer',
  },
  importError: {
    display: 'flex', alignItems: 'center', color: '#ef4444',
    fontSize: '0.8rem', marginBottom: '1rem',
  },
}
