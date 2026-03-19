'use client'

import { Modal } from './Modal'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
}

export function ConfirmDialog({ message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }: Props) {
  return (
    <Modal title="Are you sure?" onClose={onCancel} width={360}>
      <div style={{ padding: '1.25rem 1.5rem' }}>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={s.cancel}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{ ...s.confirm, background: danger ? '#ef4444' : 'var(--color-primary)' }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const s: Record<string, React.CSSProperties> = {
  cancel: {
    background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
    color: 'var(--color-muted)',
  },
  confirm: {
    border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem',
    cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: '#fff',
  },
}
