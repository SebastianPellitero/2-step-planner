'use client'

type GroupMode = 'city' | 'type'

interface Props {
  value: GroupMode
  onChange: (mode: GroupMode) => void
}

export function GroupToggle({ value, onChange }: Props) {
  return (
    <div style={s.wrap}>
      {(['city', 'type'] as GroupMode[]).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          style={{ ...s.btn, ...(value === mode ? s.active : {}) }}
        >
          {mode === 'city' ? 'City' : 'Category'}
        </button>
      ))}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', background: '#f1f1f3', borderRadius: '20px', padding: '3px', gap: '0',
  },
  btn: {
    padding: '0.3rem 0.875rem', borderRadius: '16px', border: 'none',
    background: 'transparent', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
    color: 'var(--color-muted)',
  },
  active: {
    background: '#fff', fontWeight: 700, color: '#111',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
}
