import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiClient } from '../lib/api'

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

interface User {
  id: string
  email: string
  createdAt: string
}

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  setAuth: (token: string, user: User) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: async (token, user) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ])
    apiClient.setToken(token)
    set({ token, user })
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ])
    apiClient.setToken(null)
    set({ token: null, user: null })
  },

  initialize: async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ])
      if (token && userJson) {
        apiClient.setToken(token)
        set({ token, user: JSON.parse(userJson) as User, isLoading: false })
      } else {
        // Missing either token or user — clear both and require fresh login
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(USER_KEY),
        ])
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
