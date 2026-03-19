'use client'

import { useState } from 'react'
import { BUILT_IN_TYPES, CATEGORY_CONFIG } from '@/lib/categories'
import { useCategoryStore } from '@/store/categories'

export function CategoryManager() {
  const { customCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore()

  const [newEmoji, setNewEmoji] = useState('')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editEmoji, setEditEmoji] = useState('')
  const [editName, setEditName] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmoji.trim()) return
    addCategory(newName.trim(), newEmoji.trim())
    setNewName('')
    setNewEmoji('')
  }

  function startEdit(id: string, name: string, emoji: string) {
    setEditingId(id)
    setEditName(name)
    setEditEmoji(emoji)
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingId || !editName.trim() || !editEmoji.trim()) return
    updateCategory(editingId, { name: editName.trim(), emoji: editEmoji.trim() })
    setEditingId(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Built-in */}
      <section>
        <h2 style={s.sectionTitle}>Built-in categories</h2>
        <div style={s.list}>
          {BUILT_IN_TYPES.map((type) => {
            const { label, emoji, color, bg } = CATEGORY_CONFIG[type]
            return (
              <div key={type} style={s.row}>
                <div style={{ ...s.badge, background: bg }}>
                  <span style={{ fontSize: '1.25rem' }}>{emoji}</span>
                </div>
                <span style={{ fontWeight: 600, color }}>{label}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-muted)' }}>Built-in</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Custom */}
      <section>
        <h2 style={s.sectionTitle}>Custom categories</h2>
        <div style={s.list}>
          {customCategories.length === 0 && (
            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>No custom categories yet.</p>
          )}
          {customCategories.map((cat) => (
            <div key={cat.id} style={s.row}>
              {editingId === cat.id ? (
                <form onSubmit={handleUpdate} style={{ display: 'flex', gap: '0.5rem', flex: 1, alignItems: 'center' }}>
                  <input value={editEmoji} onChange={(e) => setEditEmoji(e.target.value)} maxLength={2} style={{ ...s.emojiInput }} placeholder="🌄" />
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...s.nameInput }} placeholder="Category name" autoFocus />
                  <button type="submit" style={s.saveBtn}>Save</button>
                  <button type="button" onClick={() => setEditingId(null)} style={s.cancelBtn}>Cancel</button>
                </form>
              ) : (
                <>
                  <div style={{ ...s.badge, background: '#f1f5f9' }}>
                    <span style={{ fontSize: '1.25rem' }}>{cat.emoji}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEdit(cat.id, cat.name, cat.emoji)} style={s.iconBtn}>✏️</button>
                    <button onClick={() => deleteCategory(cat.id)} style={{ ...s.iconBtn, color: '#ef4444' }}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <form onSubmit={handleAdd} style={s.addForm}>
          <input
            value={newEmoji} onChange={(e) => setNewEmoji(e.target.value)}
            maxLength={2} placeholder="🌄" style={s.emojiInput}
          />
          <input
            value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name…" style={{ ...s.nameInput, flex: 1 }}
          />
          <button type="submit" disabled={!newName.trim() || !newEmoji.trim()} style={s.addBtn}>
            + Add
          </button>
        </form>
      </section>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  sectionTitle: { fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' },
  row: {
    display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff',
    borderRadius: '10px', padding: '0.625rem 0.875rem',
    border: '1px solid var(--color-border)',
  },
  badge: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px' },
  addForm: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' },
  emojiInput: {
    width: '52px', textAlign: 'center', padding: '0.6rem 0.25rem',
    border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1.1rem',
    background: '#f9fafb', outline: 'none',
  },
  nameInput: {
    padding: '0.6rem 0.875rem', border: '1px solid var(--color-border)',
    borderRadius: '8px', fontSize: '0.9rem', background: '#f9fafb', outline: 'none', color: '#111',
  },
  addBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '0.6rem 1.25rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
  },
  saveBtn: {
    background: 'var(--color-primary)', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '0.4rem 0.875rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
  },
  cancelBtn: {
    background: 'none', border: '1px solid var(--color-border)', borderRadius: '8px',
    padding: '0.4rem 0.875rem', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--color-muted)',
  },
}
