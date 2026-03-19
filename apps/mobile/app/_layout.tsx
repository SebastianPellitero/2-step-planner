import { useEffect, useState } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/auth'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 1000 } },
})

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const segments = useSegments()
  const { token, isLoading, initialize } = useAuthStore()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    initialize().then(() => setInitialized(true))
  }, [])

  useEffect(() => {
    if (!initialized) return
    const inLogin = segments[0] === 'login'
    if (!token && !inLogin) {
      router.replace('/login')
    } else if (token && inLogin) {
      router.replace('/(tabs)/plan')
    }
  }, [token, initialized, segments])

  if (isLoading || !initialized) return null

  return <>{children}</>
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
