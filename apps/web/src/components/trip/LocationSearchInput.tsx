'use client'

import { useRef, useState } from 'react'
import type { LocationResult } from '@holiday-planner/shared'
import { locationProvider } from '@/lib/location'

interface Props {
  value: string
  onSelect: (result: LocationResult) => void
  placeholder?: string
}

export function LocationSearchInput({ value, onSelect, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(text: string) {
    setQuery(text)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (text.trim().length < 3) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await locationProvider.search(text, { limit: 5 })
        setResults(res)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  function handleSelect(result: LocationResult) {
    setQuery(result.address)
    setResults([])
    onSelect(result)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={s.row}>
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder ?? 'Search for a place…'}
          style={s.input}
          autoComplete="off"
        />
        {loading && <span style={s.spinner}>⏳</span>}
      </div>
      {results.length > 0 && (
        <div style={s.dropdown}>
          {results.map((r, i) => (
            <button
              key={r.placeId}
              style={{ ...s.result, ...(i < results.length - 1 ? s.resultBorder : {}) }}
              onMouseDown={() => handleSelect(r)}
            >
              <div style={s.name}>{r.name}</div>
              <div style={s.addr}>{r.address}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  row: {
    display: 'flex', alignItems: 'center',
    background: '#f9fafb', border: '1px solid var(--color-border)', borderRadius: '8px',
  },
  input: {
    flex: 1, padding: '0.7rem 0.875rem', fontSize: '0.9rem', color: '#111',
    background: 'transparent', border: 'none', outline: 'none',
  },
  spinner: { padding: '0 0.75rem', fontSize: '0.75rem' },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
    background: '#fff', border: '1px solid var(--color-border)', borderRadius: '10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, overflow: 'hidden',
  },
  result: {
    display: 'block', width: '100%', background: 'none', border: 'none',
    textAlign: 'left', padding: '0.6rem 0.875rem', cursor: 'pointer',
  },
  resultBorder: { borderBottom: '1px solid #f3f4f6' },
  name: { fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: '2px' },
  addr: { fontSize: '0.775rem', color: 'var(--color-muted)' },
}
