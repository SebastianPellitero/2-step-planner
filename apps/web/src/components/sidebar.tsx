'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserArea } from '@/components/sidebar/UserArea'

const links = [
  { href: '/plan',                label: 'Plan',       icon: '📋' },
  { href: '/explore',             label: 'Explore',    icon: '🗺️' },
  { href: '/discover',            label: 'Discover',   icon: '🌍' },
  { href: '/settings/categories', label: 'Categories', icon: '🏷️' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav style={s.nav}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Holiday Planner</h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {links.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.6rem 0.75rem', borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : 'var(--color-text)',
                background: active ? '#eff6ff' : 'transparent',
              }}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </div>

      <UserArea />
    </nav>
  )
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    width: '220px', borderRight: '1px solid var(--color-border)',
    background: 'var(--color-surface)', display: 'flex', flexDirection: 'column',
    padding: '1.5rem 1rem', gap: '0.5rem',
  },
}
