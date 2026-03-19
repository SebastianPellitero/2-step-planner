import { useState } from 'react'
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  Modal, TextInput, ScrollView, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Place, PlaceType } from '@holiday-planner/shared'
import type { LocationResult } from '@holiday-planner/shared'
import { apiClient } from '../../lib/api'
import { LocationSearchInput } from '../../components/LocationSearchInput'

// ── Types ─────────────────────────────────────────────────────────────────────

type GroupMode = 'city' | 'type'

// ── Type config ───────────────────────────────────────────────────────────────

const BUILT_IN_TYPES: PlaceType[] = [
  'RESTAURANT','MUSEUM','HIKE','HOTEL','NATURE','TEMPLE','BEACH','MARKET','BAR','SHOP','OTHER',
]

const TYPE_CONFIG: Record<PlaceType, { label: string; bg: string; color: string }> = {
  RESTAURANT: { label: 'Restaurant', bg: '#fff7ed', color: '#c2410c' },
  MUSEUM:     { label: 'Museum',     bg: '#f5f3ff', color: '#7c3aed' },
  HIKE:       { label: 'Hike',       bg: '#f0fdf4', color: '#15803d' },
  HOTEL:      { label: 'Hotel',      bg: '#ecfeff', color: '#0e7490' },
  NATURE:     { label: 'Nature',     bg: '#f0fdf4', color: '#166534' },
  TEMPLE:     { label: 'Temple',     bg: '#fffbeb', color: '#b45309' },
  BEACH:      { label: 'Beach',      bg: '#eff6ff', color: '#1d4ed8' },
  MARKET:     { label: 'Market',     bg: '#fdf4ff', color: '#7e22ce' },
  BAR:        { label: 'Bar',        bg: '#fff1f2', color: '#be123c' },
  SHOP:       { label: 'Shop',       bg: '#fdf2f8', color: '#be185d' },
  OTHER:      { label: 'Other',      bg: '#f9fafb', color: '#4b5563' },
}

function getTypeConfig(type: string) {
  return TYPE_CONFIG[type as PlaceType] ?? { label: type, bg: '#f1f5f9', color: '#475569' }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupPlaces(places: Place[], mode: GroupMode) {
  const key = mode === 'city' ? 'city' : 'type'
  const map: Record<string, Place[]> = {}
  for (const p of places) {
    const k = (p[key as keyof Place] as string) || (mode === 'city' ? 'Unknown' : 'OTHER')
    if (!map[k]) map[k] = []
    map[k].push(p)
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }))
}

// ── Place modal ───────────────────────────────────────────────────────────────

function PlaceModal({
  place,
  tripId,
  onClose,
}: {
  place: Place | null
  tripId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()

  const [name, setName]               = useState(place?.name            ?? '')
  const [address, setAddress]         = useState(place?.address         ?? '')
  const [city, setCity]               = useState(place?.city            ?? '')
  const [country, setCountry]         = useState(place?.country         ?? '')
  const [latitude, setLatitude]       = useState<number | null>(place?.latitude  ?? null)
  const [longitude, setLongitude]     = useState<number | null>(place?.longitude ?? null)
  const [locationPlaceId, setPlaceId] = useState(place?.locationPlaceId ?? null)
  const [type, setType]               = useState<string>(place?.type ?? 'OTHER')
  const [notes, setNotes]             = useState(place?.notes ?? '')

  const [customTypes, setCustomTypes]   = useState<string[]>([])
  const [addingCustom, setAddingCustom] = useState(false)
  const [newTypeName, setNewTypeName]   = useState('')

  function handleLocationSelect(result: LocationResult) {
    if (!place && !name.trim()) setName(result.name)
    setAddress(result.address)
    setCity(result.city)
    setCountry(result.country)
    setLatitude(result.latitude)
    setLongitude(result.longitude)
    setPlaceId(result.placeId)
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const apiType = BUILT_IN_TYPES.includes(type as PlaceType)
        ? (type as PlaceType)
        : 'OTHER'
      const created = await apiClient.createPlace({
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        locationPlaceId: locationPlaceId ?? undefined,
        type: apiType,
        notes: notes.trim() || undefined,
      })
      await apiClient.addPlaceToTrip(tripId, created.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      onClose()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      const apiType = BUILT_IN_TYPES.includes(type as PlaceType)
        ? (type as PlaceType)
        : 'OTHER'
      await apiClient.updatePlace(place!.id, {
        name: name.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        locationPlaceId: locationPlaceId ?? undefined,
        type: apiType,
        notes: notes.trim() || undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
      onClose()
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  function handleSave() {
    if (!name.trim()) return
    place ? updateMutation.mutate() : createMutation.mutate()
  }

  function commitCustomType() {
    const trimmed = newTypeName.trim().toUpperCase()
    const all = [...BUILT_IN_TYPES, ...customTypes]
    if (trimmed && !all.includes(trimmed as PlaceType)) {
      setCustomTypes((prev) => [...prev, trimmed])
      setType(trimmed)
    }
    setNewTypeName('')
    setAddingCustom(false)
  }

  const allTypes = [...BUILT_IN_TYPES, ...customTypes]

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={m.root}>
        <View style={m.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={m.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={m.title}>{place ? 'Edit Place' : 'New Place'}</Text>
          <TouchableOpacity onPress={handleSave} disabled={isPending || !name.trim()}>
            {isPending
              ? <ActivityIndicator color="#2563eb" />
              : <Text style={[m.save, !name.trim() && m.saveDisabled]}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={m.body} keyboardShouldPersistTaps="handled">
          {error && (
            <Text style={m.error}>{error instanceof Error ? error.message : 'Save failed'}</Text>
          )}

          <Text style={m.label}>Name</Text>
          <TextInput
            style={m.input} value={name} onChangeText={setName}
            placeholder="Place name" placeholderTextColor="#9ca3af"
          />

          <Text style={m.label}>Location</Text>
          <LocationSearchInput
            value={address}
            onSelect={handleLocationSelect}
            placeholder="Search for a place or address…"
          />
          {(city || country) ? (
            <Text style={m.locationMeta}>{[city, country].filter(Boolean).join(', ')}</Text>
          ) : null}

          <Text style={m.label}>Category</Text>
          <View style={m.pills}>
            {allTypes.map((t) => {
              const cfg = getTypeConfig(t)
              const active = t === type
              return (
                <TouchableOpacity
                  key={t} onPress={() => setType(t)}
                  style={[m.pill, { backgroundColor: cfg.bg }, active && { borderColor: cfg.color }]}
                >
                  <Text style={[m.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                </TouchableOpacity>
              )
            })}
            {addingCustom ? (
              <TextInput
                style={m.customInput} value={newTypeName} onChangeText={setNewTypeName}
                placeholder="Type name…" placeholderTextColor="#9ca3af"
                autoFocus returnKeyType="done"
                onSubmitEditing={commitCustomType} onBlur={commitCustomType}
              />
            ) : (
              <TouchableOpacity style={m.addPill} onPress={() => setAddingCustom(true)}>
                <Text style={m.addPillText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={m.label}>Notes</Text>
          <TextInput
            style={[m.input, m.textArea]} value={notes} onChangeText={setNotes}
            placeholder="Any notes…" placeholderTextColor="#9ca3af" multiline
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const queryClient = useQueryClient()

  const [groupMode, setGroupMode] = useState<GroupMode>('city')
  const [modal, setModal]         = useState<Place | 'new' | null>(null)

  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => apiClient.getTrip(tripId),
    enabled: !!tripId,
  })

  const { data: places = [], isLoading } = useQuery({
    queryKey: ['places', tripId],
    queryFn: () => apiClient.getPlaces({ tripId }),
    enabled: !!tripId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePlace(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, visited }: { id: string; visited: boolean }) =>
      apiClient.updatePlace(id, { visited }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['places'] }),
  })

  const sections = groupPlaces(places as Place[], groupMode)

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: trip?.name ?? 'Trip',
          headerBackTitle: 'Back',
        }}
      />

      <View style={s.toolbar}>
        <View style={s.toggle}>
          {(['city', 'type'] as GroupMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[s.toggleBtn, groupMode === mode && s.toggleActive]}
              onPress={() => setGroupMode(mode)}
            >
              <Text style={[s.toggleText, groupMode === mode && s.toggleTextActive]}>
                {mode === 'city' ? 'City' : 'Category'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => setModal('new')}>
          <Text style={s.addBtnText}>+ Place</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2563eb" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <Text style={s.empty}>No places yet. Tap "+ Place" to add one.</Text>
          }
          renderSectionHeader={({ section: { title } }) => (
            <Text style={s.sectionHeader}>
              {groupMode === 'type' ? getTypeConfig(title).label : `— ${title}`}
            </Text>
          )}
          renderItem={({ item }) => {
            const cfg = getTypeConfig(item.type)
            return (
              <View style={s.row}>
                <TouchableOpacity
                  style={[s.dot, item.visited && s.dotDone]}
                  onPress={() => toggleMutation.mutate({ id: item.id, visited: !item.visited })}
                />
                <View style={s.info}>
                  <Text style={[s.name, item.visited && s.nameVisited]}>{item.name}</Text>
                  <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                    <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                </View>
                <View style={s.actions}>
                  <TouchableOpacity style={s.actionBtn} onPress={() => setModal(item as Place)}>
                    <Text style={s.actionIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn} onPress={() => deleteMutation.mutate(item.id)}>
                    <Text style={s.actionIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          }}
        />
      )}

      {modal !== null && (
        <PlaceModal
          place={modal === 'new' ? null : modal as Place}
          tripId={tripId}
          onClose={() => setModal(null)}
        />
      )}
    </SafeAreaView>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f7' },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  toggle: { flexDirection: 'row', backgroundColor: '#f1f1f3', borderRadius: 20, padding: 3 },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  toggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  toggleText:       { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  toggleTextActive: { color: '#111', fontWeight: '700' },
  addBtn: { backgroundColor: '#2563eb', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 14 },
  sectionHeader: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: 16, marginBottom: 6,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 10, padding: 12, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  dot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#d1d5db',
    marginRight: 12, flexShrink: 0,
  },
  dotDone:      { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  info:         { flex: 1, gap: 4 },
  name:         { fontSize: 15, fontWeight: '600', color: '#111' },
  nameVisited:  { textDecorationLine: 'line-through', color: '#9ca3af' },
  pill:         { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pillText:     { fontSize: 11, fontWeight: '600' },
  actions:      { flexDirection: 'row', gap: 4 },
  actionBtn:    { padding: 4 },
  actionIcon:   { fontSize: 16 },
})

const m = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  title:        { fontSize: 17, fontWeight: '700' },
  cancel:       { fontSize: 16, color: '#6b7280' },
  save:         { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  saveDisabled: { color: '#9ca3af' },
  body:         { padding: 20, paddingBottom: 60 },
  error: {
    backgroundColor: '#fef2f2', color: '#dc2626',
    borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 8,
  },
  label: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
    textTransform: 'uppercase', letterSpacing: 0.6,
    marginTop: 20, marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb', borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  locationMeta: { marginTop: 6, fontSize: 12, color: '#6b7280', paddingHorizontal: 2 },
  pills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  addPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#d1d5db', borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },
  addPillText: { fontSize: 16, color: '#6b7280', fontWeight: '700' },
  customInput: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#2563eb', backgroundColor: '#eff6ff',
    fontSize: 13, color: '#111', minWidth: 100,
  },
})
