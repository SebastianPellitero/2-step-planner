'use client'

import { useState } from 'react'
import type { Place, PlaceType, LocationResult } from '@holiday-planner/shared'
import { Modal } from '@/components/ui/Modal'
import { LocationSearchInput } from './LocationSearchInput'
import { BUILT_IN_TYPES, CATEGORY_CONFIG, getCategoryConfig } from '@/lib/categories'
import { useCategoryStore } from '@/store/categories'

interface Props {
  place: Place | null
  tripId: string
  onSave: (data: PlaceFormData) => void
  onClose: () => void
  loading?: boolean
  error?: string | null
}

export interface PlaceFormData {
  name: string
  address?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  locationPlaceId?: string
  type: PlaceType
  notes?: string
}

export function PlaceModal({ place, onSave, onClose, loading, error }: Props) {
  const { customCategories } = useCategoryStore()

  const [name, setName] = useState(place?.name ?? '')
  const [address, setAddress] = useState(place?.address ?? '')
  const [city, setCity] = useState(place?.city ?? '')
  const [country, setCountry] = useState(place?.country ?? '')
  const [latitude, setLatitude] = useState<number | undefined>(place?.latitude ?? undefined)
  const [longitude, setLongitude] = useState<number | undefined>(place?.longitude ?? undefined)
  const [locationPlaceId, setPlaceId] = useState<string | undefined>(place?.locationPlaceId ?? undefined)
  const [type, setType] = useState<string>(place?.type ?? 'OTHER')
  const [notes, setNotes] = useState(place?.notes ?? '')
  const [addingCustom, setAddingCustom] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')
  const [localCustomTypes, setLocalCustomTypes] = useState<{ name: string; emoji: string }[]>([])

  function handleLocationSelect(r: LocationResult) {
    if (!place && !name.trim()) setName(r.name)
    setAddress(r.address)
    setCity(r.city)
    setCountry(r.country)
    setLatitude(r.latitude)
    setLongitude(r.longitude)
    setPlaceId(r.placeId)
  }

  function commitCustomType() {
    const trimmed = newTypeName.trim()
    if (!trimmed) { setAddingCustom(false); setNewTypeName(''); return }
    setLocalCustomTypes((prev) => [...prev, { name: trimmed, emoji: '📍' }])
    setType(trimmed.toUpperCase())
    setNewTypeName('')
    setAddingCustom(false)
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const apiType = BUILT_IN_TYPES.includes(type as PlaceType) ? (type as PlaceType) : 'OTHER'
    onSave({
      name: name.trim(),
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      latitude,
      longitude,
      locationPlaceId,
      type: apiType,
      notes: notes || undefined,
    })
  }

  const allTypes = [
    ...BUILT_IN_TYPES,
    ...customCategories.map((c) => c.name.toUpperCase()),
    ...localCustomTypes.map((c) => c.name.toUpperCase()),
  ]

  return (
    <Modal title={place ? 'Edit Place' : 'New Place'} onClose={onClose} width={520}>
      <form onSubmit={handleSave} style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
        {error && <div style={s.error}>{error}</div>}

        <div style={s.field}>
          <label style={s.label}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Place name" style={s.input} autoFocus />
        </div>

        <div style={s.field}>
          <label style={s.label}>Location</label>
          <LocationSearchInput value={address} onSelect={handleLocationSelect} placeholder="Search for a place or address…" />
          {(city || country) && (
            <span style={{ fontSize: '0.775rem', color: 'var(--color-muted)', marginTop: '4px' }}>
              {[city, country].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        <div style={s.field}>
          <label style={s.label}>Category</label>
          <div style={s.pills}>
            {allTypes.map((t) => {
              const cfg = BUILT_IN_TYPES.includes(t as PlaceType)
                ? CATEGORY_CONFIG[t as PlaceType]
                : getCategoryConfig(t, customCategories)
              const active = t === type
              return (
                <button
                  key={t} type="button" onClick={() => setType(t)}
                  style={{
                    ...s.pill,
                    background: cfg.bg,
                    color: cfg.color,
                    borderColor: active ? cfg.color : 'transparent',
                  }}
                >
                  {cfg.emoji} {cfg.label}
                </button>
              )
            })}
            {addingCustom ? (
              <input
                autoFocus value={newTypeName} onChange={(e) => setNewTypeName(e.target.value)}
                onBlur={commitCustomType}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitCustomType() } }}
                placeholder="Type name…" style={s.customInput}
              />
            ) : (
              <button type="button" onClick={() => setAddingCustom(true)} style={s.addPill}>+</button>
            )}
          </div>
        </div>

        <div style={s.field}>
          <label style={s.label}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes…" rows={3} style={{ ...s.input, resize: 'vertical' }} />
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
  error: { background: '#fef2f2', color: '#dc2626', borderRadius: '8px', padding: '0.6rem 0.875rem', fontSize: '0.8rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    background: '#f9fafb', border: '1px solid var(--color-border)', borderRadius: '8px',
    padding: '0.65rem 0.875rem', fontSize: '0.9rem', color: '#111', outline: 'none', width: '100%',
  },
  pills: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem' },
  pill: {
    padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1.5px solid transparent',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
  },
  addPill: {
    padding: '0.3rem 0.875rem', borderRadius: '99px', border: '1.5px dashed var(--color-border)',
    background: '#f9fafb', color: 'var(--color-muted)', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
  },
  customInput: {
    padding: '0.3rem 0.75rem', borderRadius: '99px', border: '1.5px solid var(--color-primary)',
    background: '#eff6ff', fontSize: '0.8rem', color: '#111', outline: 'none', minWidth: '100px',
  },
  cancel: {
    background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-muted)',
  },
  save: {
    background: 'var(--color-primary)', border: 'none', borderRadius: '8px',
    padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, color: '#fff',
  },
}
