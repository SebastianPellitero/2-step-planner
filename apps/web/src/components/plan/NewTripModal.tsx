'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

interface Props {
  onSave: (name: string) => void
  onClose: () => void
  loading?: boolean
}

export function NewTripModal({ onSave, onClose, loading }: Props) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onSave(name.trim())
  }

  return (
    <Modal title="New Trip" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Japan 2025"
          style={s.input}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={onClose} style={s.cancel}>Cancel</button>
          <button type="submit" disabled={!name.trim() || loading} style={s.create}>
            {loading ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

const s: Record<string, React.CSSProperties> = {
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
  create: {
    background: 'var(--color-primary)', border: 'none', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700,
    color: '#fff',
  },
}
