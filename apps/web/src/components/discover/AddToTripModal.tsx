'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ExportPlace, Trip } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'

interface Props {
  places: ExportPlace[]
  listTitle: string
  onClose: () => void
}

type Status = 'idle' | 'adding' | 'done'

export function AddToTripModal({ places, listTitle, onClose }: Props) {
  const queryClient = useQueryClient()
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<{ added: number; errors: number } | null>(null)

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
  })

  async function handleConfirm() {
    if (!selectedTripId) return
    setStatus('adding')
    let added = 0
    let errors = 0
    for (let i = 0; i < places.length; i++) {
      const p = places[i]
      try {
        const place = await apiClient.createPlace({
          name: p.name,
          type: p.type,
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
          address: p.address ?? undefined,
          notes: p.notes ?? undefined,
          description: p.description ?? undefined,
        })
        await apiClient.addPlaceToTrip(selectedTripId, place.id, i)
        added++
      } catch {
        errors++
      }
    }
    queryClient.invalidateQueries({ queryKey: ['trips'] })
    setResult({ added, errors })
    setStatus('done')
  }

  return (
    <Modal title={`Add "${listTitle}" to Trip`} onClose={onClose} width={400}>
      <div style={s.body}>
        {status === 'idle' && (
          <>
            <p style={s.hint}>Choose a trip to add all {places.length} places to:</p>
            <div style={s.tripList}>
              {(trips as Trip[]).length === 0 ? (
                <p style={s.empty}>No trips yet — create one on the Plan page first.</p>
              ) : (
                (trips as Trip[]).map((trip) => (
                  <button
                    key={trip.id}
                    style={{ ...s.tripRow, ...(selectedTripId === trip.id ? s.tripRowSelected : {}) }}
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <span>{trip.name}</span>
                    {selectedTripId === trip.id && <span style={s.check}>✓</span>}
                  </button>
                ))
              )}
            </div>
            <div style={s.footer}>
              <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                style={{ ...s.confirmBtn, ...(!selectedTripId ? s.confirmBtnDisabled : {}) }}
                disabled={!selectedTripId}
                onClick={handleConfirm}
              >
                Add {places.length} places
              </button>
            </div>
          </>
        )}

        {status === 'adding' && (
          <p style={s.hint}>Adding places…</p>
        )}

        {status === 'done' && result && (
          <>
            <p style={s.successText}>
              {result.added} place{result.added !== 1 ? 's' : ''} added to your trip.
            </p>
            {result.errors > 0 && (
              <p style={s.warnText}>{result.errors} place{result.errors !== 1 ? 's' : ''} could not be added.</p>
            )}
            <div style={s.footer}>
              <button style={s.confirmBtn} onClick={onClose}>Done</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

const s: Record<string, React.CSSProperties> = {
  body: { padding: '1.25rem 1.5rem' },
  hint: { fontSize: '0.875rem', color: 'var(--color-muted)', marginBottom: '0.75rem' },
  empty: { fontSize: '0.875rem', color: 'var(--color-muted)', textAlign: 'center', padding: '1rem 0' },
  tripList: { display: 'flex', flexDirection: 'column', gap: '0.375rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '1rem' },
  tripRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.625rem 0.875rem', borderRadius: '10px',
    border: '1.5px solid var(--color-border)', background: '#fff',
    cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500, textAlign: 'left',
  },
  tripRowSelected: { borderColor: 'var(--color-primary)', background: '#eff6ff', color: 'var(--color-primary)' },
  check: { fontWeight: 700, color: 'var(--color-primary)' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' },
  cancelBtn: {
    background: 'transparent', border: '1.5px solid var(--color-border)', borderRadius: '20px',
    padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
  },
  confirmBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '20px', padding: '0.5rem 1.25rem', fontWeight: 700,
    fontSize: '0.875rem', cursor: 'pointer',
  },
  confirmBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  successText: { fontSize: '0.95rem', fontWeight: 600, color: '#16a34a', marginBottom: '0.5rem' },
  warnText: { fontSize: '0.875rem', color: '#f59e0b', marginBottom: '1rem' },
}
