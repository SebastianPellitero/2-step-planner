import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../store/auth'

export default function AccountScreen() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  if (!user) return null

  const initial = user.email.charAt(0).toUpperCase()
  const hue = user.email.split('').reduce((n, c) => n + c.charCodeAt(0), 0) % 360

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={[s.avatar, { backgroundColor: `hsl(${hue},60%,50%)` }]}>
          <Text style={s.avatarText}>{initial}</Text>
        </View>
        <Text style={s.email}>{user.email}</Text>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={s.logoutText}>Sign out</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
  },
  email: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 15,
  },
})
