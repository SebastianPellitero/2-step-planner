'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'

export default function RegisterPage() {
  const router = useRouter()
  const { token, register } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) router.replace('/plan')
  }, [token, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      await register(email.trim(), password)
      router.push('/plan')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <h1 style={s.title}>Holiday Planner</h1>
        <p style={s.sub}>Create your account</p>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={s.input}
            />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              style={s.input}
            />
          </div>
          <button type="submit" disabled={loading || !email || !password} style={s.btn}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={s.toggle}>
          Already have an account?{' '}
          <Link href="/login" style={s.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', background: '#f0f4ff', padding: '1rem',
  },
  card: {
    width: '100%', maxWidth: '380px', background: '#fff',
    borderRadius: '16px', padding: '2.5rem 2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#111', marginBottom: '0.25rem' },
  sub: { fontSize: '0.9rem', color: 'var(--color-muted)', marginBottom: '1.5rem' },
  error: {
    background: '#fef2f2', color: '#dc2626', borderRadius: '8px',
    padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    background: '#f9fafb', border: '1px solid var(--color-border)',
    borderRadius: '8px', padding: '0.7rem 0.875rem', fontSize: '0.95rem', color: '#111',
    outline: 'none', width: '100%',
  },
  btn: {
    marginTop: '0.5rem', background: 'var(--color-primary)', color: '#fff',
    border: 'none', borderRadius: '8px', padding: '0.75rem',
    fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
  },
  toggle: { marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-muted)' },
  link: { color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' },
}
