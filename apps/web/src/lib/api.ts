import { ApiClient } from '@holiday-planner/shared'

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
)

// Keep token in sync from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('token')
  if (stored) apiClient.setToken(stored)
}
