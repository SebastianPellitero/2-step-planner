'use client'

import { useEffect } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: number
}

export function Modal({ title, onClose, children, width = 420 }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div style={s.backdrop} onClick={onClose}>
      <div style={{ ...s.dialog, maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <span style={s.title}>{title}</span>
          <button onClick={onClose} style={s.close}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  dialog: {
    width: '100%', background: '#fff', borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.16)', overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)',
  },
  title: { fontSize: '1rem', fontWeight: 700 },
  close: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-muted)', fontSize: '1rem', lineHeight: 1,
  },
}
