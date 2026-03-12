import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@holiday-planner/shared'
import { apiClient } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (email, password) => {
        const { user, token } = await apiClient.login({ email, password })
        apiClient.setToken(token)
        set({ user, token })
      },

      register: async (email, password) => {
        const { user, token } = await apiClient.register({ email, password })
        apiClient.setToken(token)
        set({ user, token })
      },

      logout: () => {
        apiClient.setToken(null)
        set({ user: null, token: null })
      },
    }),
    {
      name: 'auth',
      onRehydrateStorage: () => (state) => {
        if (state?.token) apiClient.setToken(state.token)
      },
    }
  )
)
