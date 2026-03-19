'use client'

interface Props {
  onDismiss: () => void
}

export function LocationBanner({ onDismiss }: Props) {
  return (
    <div style={s.banner}>
      <span>📍 Enable location to center the map and see nearby places</span>
      <button onClick={onDismiss} style={s.dismiss}>✕</button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    background: '#1e40af', color: '#fff', padding: '0.625rem 1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    fontSize: '0.875rem',
  },
  dismiss: {
    background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '1rem',
  },
}
