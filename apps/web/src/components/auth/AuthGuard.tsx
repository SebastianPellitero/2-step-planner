'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!token) router.replace('/login')
  }, [token, router, pathname])

  if (!token) return null

  return <>{children}</>
}
