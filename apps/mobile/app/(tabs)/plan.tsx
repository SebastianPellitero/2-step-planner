import { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Modal, TextInput, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../../lib/api'
import type { Trip } from '@holiday-planner/shared'

const EMOJI_LIST = ['🗺️', '✈️', '🧳', '🏖️', '🏔️', '🌍', '🏛️', '🌆', '🎌', '🏝️']
function tripEmoji(id: string) {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return EMOJI_LIST[n % EMOJI_LIST.length]
}

export default function PlanScreen() {
  const queryClient = useQueryClient()
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => apiClient.getTrips(),
  })

  const createTrip = useMutation({
    mutationFn: (name: string) => apiClient.createTrip({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setShowNew(false)
      setNewName('')
    },
  })

  function handleCreate() {
    const name = newName.trim()
    if (!name) return
    createTrip.mutate(name)
  }

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Wishlist</Text>
        <TouchableOpacity style={s.newBtn} onPress={() => setShowNew(true)}>
          <Text style={s.newBtnText}>+ Trip</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.subtitle}>Places to go</Text>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <FlatList
          data={trips as Trip[]}
          numColumns={2}
          keyExtractor={(t) => t.id}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <Text style={s.empty}>No trips yet. Tap "+ Trip" to create one.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.75}
              onPress={() => router.push(`/trip/${item.id}`)}
            >
              <Text style={s.cardEmoji}>{tripEmoji(item.id)}</Text>
              <Text style={s.cardName}>{item.name}</Text>
              {item.description ? (
                <Text style={s.cardDesc} numberOfLines={1}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          )}
        />
      )}

      {/* New trip modal */}
      <Modal visible={showNew} transparent animationType="fade" onRequestClose={() => setShowNew(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setShowNew(false)}>
          <TouchableOpacity style={s.dialog} activeOpacity={1}>
            <Text style={s.dialogTitle}>New Trip</Text>
            <TextInput
              style={s.dialogInput}
              placeholder="e.g. Japan 2025"
              placeholderTextColor="#9ca3af"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={s.dialogActions}>
              <TouchableOpacity onPress={() => { setShowNew(false); setNewName('') }}>
                <Text style={s.dialogCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.dialogCreate, !newName.trim() && s.dialogCreateDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim() || createTrip.isPending}
              >
                {createTrip.isPending
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.dialogCreateText}>Create</Text>
                }
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
  newBtn: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  subtitle: { fontSize: 15, color: '#6b7280', paddingHorizontal: 20, paddingBottom: 12 },
  list: { paddingHorizontal: 14, paddingBottom: 20 },
  row: { gap: 12, marginBottom: 12 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, minHeight: 130,
  },
  cardEmoji: { fontSize: 36, marginBottom: 10 },
  cardName: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  cardDesc: { fontSize: 13, color: '#9ca3af' },
  // Modal
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  dialog: {
    width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24,
  },
  dialogTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  dialogInput: {
    backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111',
  },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  dialogCancel: { fontSize: 15, color: '#6b7280', paddingVertical: 10 },
  dialogCreate: {
    backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  dialogCreateDisabled: { opacity: 0.4 },
  dialogCreateText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
