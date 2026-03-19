import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiClient } from '../lib/api'

const TOKEN_KEY = 'auth_token'

interface User {
  id: string
  email: string
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
    await AsyncStorage.setItem(TOKEN_KEY, token)
    apiClient.setToken(token)
    set({ token, user })
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY)
    apiClient.setToken(null)
    set({ token: null, user: null })
  },

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY)
      if (token) {
        apiClient.setToken(token)
        set({ token, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },
}))
