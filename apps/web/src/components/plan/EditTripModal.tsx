'use client'

import { useState } from 'react'
import type { Trip } from '@holiday-planner/shared'
import { Modal } from '@/components/ui/Modal'

interface Props {
  trip: Trip
  onSave: (name: string, description: string) => void
  onClose: () => void
  loading?: boolean
}

export function EditTripModal({ trip, onSave, onClose, loading }: Props) {
  const [name, setName] = useState(trip.name)
  const [description, setDescription] = useState(trip.description ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onSave(name.trim(), description.trim())
  }

  return (
    <Modal title="Edit Trip" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={s.label}>Name</label>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} style={s.input} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={s.label}>Description (optional)</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" style={s.input} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} style={s.cancel}>Cancel</button>
          <button type="submit" disabled={!name.trim() || loading} style={s.save}>
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const s: Record<string, React.CSSProperties> = {
  label: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: '#f9fafb', border: '1px solid var(--color-border)',
    borderRadius: '8px', padding: '0.7rem 0.875rem', fontSize: '0.95rem',
    color: '#111', outline: 'none', width: '100%',
  },
  cancel: {
    background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
    color: 'var(--color-muted)',
  },
  save: {
    background: 'var(--color-primary)', border: 'none', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: '#fff',
  },
}
