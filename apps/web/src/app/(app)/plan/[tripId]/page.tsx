'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Place } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { GroupToggle } from '@/components/trip/GroupToggle'
import { PlaceList } from '@/components/trip/PlaceList'
import { PlaceModal, type PlaceFormData } from '@/components/trip/PlaceModal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

type GroupMode = 'city' | 'type'

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const queryClient = useQueryClient()

  const [groupMode, setGroupMode] = useState<GroupMode>('city')
  const [modal, setModal] = useState<Place | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Place | null>(null)

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => apiClient.getTrip(tripId),
    enabled: !!tripId,
  })

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['places', tripId],
    queryFn: () => apiClient.getPlaces({ tripId }),
    enabled: !!tripId,
  })

  const [modalError, setModalError] = useState<string | null>(null)

  const createPlace = useMutation({
    mutationFn: async (data: PlaceFormData) => {
      const created = await apiClient.createPlace({ ...data, lat: 0, lng: 0 })
      await apiClient.addPlaceToTrip(tripId, created.id)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['places'] }); setModal(null); setModalError(null) },
    onError: (e) => setModalError(e instanceof Error ? e.message : 'Save failed'),
  })

  const updatePlace = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PlaceFormData }) =>
      apiClient.updatePlace(id, { ...data, lat: 0, lng: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['places'] }); setModal(null); setModalError(null) },
    onError: (e) => setModalError(e instanceof Error ? e.message : 'Save failed'),
  })

  const deletePlace = useMutation({
    mutationFn: (id: string) => apiClient.deletePlace(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['places'] }); setDeleting(null) },
  })

  const toggleVisited = useMutation({
    mutationFn: ({ id, visited }: { id: string; visited: boolean }) =>
      apiClient.updatePlace(id, { visited }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  })

  function handleSave(data: PlaceFormData) {
    if (modal === 'new') {
      createPlace.mutate(data)
    } else if (modal !== null) {
      updatePlace.mutate({ id: (modal as Place).id, data })
    }
  }

  const isPending = createPlace.isPending || updatePlace.isPending

  return (
    <div style={s.page}>
      <Link href="/plan" style={s.back}>← Wishlist</Link>
      <h1 style={s.title}>{trip?.name ?? '…'}</h1>

      <div style={s.toolbar}>
        <GroupToggle value={groupMode} onChange={setGroupMode} />
        <button style={s.addBtn} onClick={() => { setModalError(null); setModal('new') }}>+ Place</button>
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--color-muted)', marginTop: '2rem' }}>Loading…</div>
      ) : (
        <PlaceList
          places={places as Place[]}
          groupMode={groupMode}
          onEdit={(p) => { setModalError(null); setModal(p) }}
          onDelete={setDeleting}
          onToggleVisited={(p) => toggleVisited.mutate({ id: p.id, visited: !p.visited })}
        />
      )}

      {modal !== null && (
        <PlaceModal
          place={modal === 'new' ? null : modal as Place}
          tripId={tripId}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={isPending}
          error={modalError}
        />
      )}

      {deleting && (
        <ConfirmDialog
          message={`Delete "${deleting.name}"?`}
          confirmLabel="Delete"
          danger
          onConfirm={() => deletePlace.mutate(deleting.id)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '2rem', maxWidth: '720px' },
  back: { fontSize: '0.85rem', color: 'var(--color-muted)', textDecoration: 'none', display: 'inline-block', marginBottom: '0.75rem' },
  title: { fontSize: '1.75rem', fontWeight: 800, color: '#111', marginBottom: '1.25rem' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' },
  addBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '16px', padding: '0.4rem 1rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
  },
}
