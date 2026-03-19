'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function UserArea() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  const initial = user.email.charAt(0).toUpperCase()
  const hue = user.email.split('').reduce((n, c) => n + c.charCodeAt(0), 0) % 360

  function handleLogout() {
    logout()
    router.replace('/login')
  }

  return (
    <div style={s.container}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, minWidth: 0 }}>
        <div style={{ ...s.avatar, background: `hsl(${hue},60%,50%)` }}>
          {initial}
        </div>
        <span style={s.email} title={user.email}>{user.email}</span>
      </div>
      <button onClick={handleLogout} style={s.logoutBtn} title="Sign out">
        ↩
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.75rem', borderRadius: '8px',
    background: '#f9fafb', border: '1px solid var(--color-border)',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0,
  },
  email: {
    fontSize: '0.8rem', color: 'var(--color-muted)',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--color-muted)', fontSize: '1rem', flexShrink: 0,
    padding: '2px 4px', borderRadius: '4px',
  },
}
