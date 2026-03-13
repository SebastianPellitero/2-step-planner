import { useState } from 'react'
import {
  View, Text, SectionList, TouchableOpacity, StyleSheet,
  Modal, TextInput, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, useLocalSearchParams } from 'expo-router'

// ── Types ─────────────────────────────────────────────────────────────────────

type PlaceType =
  | 'RESTAURANT' | 'MUSEUM' | 'HIKE' | 'HOTEL' | 'NATURE'
  | 'TEMPLE' | 'BEACH' | 'MARKET' | 'BAR' | 'SHOP' | 'OTHER'

interface Place {
  id: string
  name: string
  type: string        // string so custom types work too
  city: string
  address: string
  notes: string
  visited: boolean
}

type GroupMode = 'city' | 'type'

// ── Mock data ─────────────────────────────────────────────────────────────────

const TRIPS: Record<string, { name: string; emoji: string }> = {
  '1': { name: 'Japan',   emoji: '🗾' },
  '2': { name: 'Greece',  emoji: '🏛️' },
  '3': { name: 'Germany', emoji: '🏰' },
  '4': { name: 'Spain',   emoji: '🌞' },
}

const INITIAL_PLACES: Record<string, Place[]> = {
  '1': [
    { id: 'p1', name: 'Kiyomizu-dera', type: 'TEMPLE',     city: 'Kyoto',    address: 'Kiyomizu, Higashiyama, Kyoto',    notes: '',                       visited: false },
    { id: 'p2', name: 'Ryoan-ji',      type: 'TEMPLE',     city: 'Kyoto',    address: 'Goryonoshita-cho, Kyoto',         notes: 'Rock garden is stunning', visited: true  },
    { id: 'p3', name: 'Meiji Jingu',   type: 'TEMPLE',     city: 'Tokyo',    address: 'Yoyogikamizonocho, Shibuya',      notes: '',                        visited: false },
    { id: 'p4', name: 'Ichiran Ramen', type: 'RESTAURANT', city: 'Tokyo',    address: 'Shinjuku, Tokyo',                 notes: 'Solo dining booths',      visited: false },
    { id: 'p5', name: 'Dotonbori',     type: 'MARKET',     city: 'Osaka',    address: 'Dotonbori, Chuo Ward, Osaka',     notes: 'Street food heaven',      visited: false },
  ],
  '2': [
    { id: 'p6', name: 'Acropolis',           type: 'MUSEUM',     city: 'Athens',    address: 'Athens 105 58, Greece', notes: '',             visited: false },
    { id: 'p7', name: 'Santorini Caldera',   type: 'NATURE',     city: 'Santorini', address: 'Oia, Santorini',        notes: 'Go at sunset', visited: false },
    { id: 'p8', name: 'Taverna To Kafeneio', type: 'RESTAURANT', city: 'Athens',    address: 'Plaka, Athens',         notes: '',             visited: false },
  ],
  '3': [
    { id: 'p9',  name: 'Brandenburg Gate', type: 'MUSEUM', city: 'Berlin',  address: 'Pariser Platz, Berlin',   notes: '',                   visited: false },
    { id: 'p10', name: 'Neuschwanstein',   type: 'NATURE', city: 'Bavaria', address: 'Schwangau, Bavaria',      notes: 'Book in advance!',   visited: false },
    { id: 'p11', name: 'Hofbräuhaus',      type: 'BAR',    city: 'Munich',  address: 'Platzl 9, München',       notes: '',                   visited: false },
    { id: 'p12', name: 'Viktualienmarkt',  type: 'MARKET', city: 'Munich',  address: 'Viktualienmarkt, Munich', notes: 'Outdoor food market', visited: false },
  ],
  '4': [
    { id: 'p13', name: 'Sagrada Família',        type: 'MUSEUM',     city: 'Barcelona', address: 'Carrer de Mallorca, 401',   notes: 'Book months ahead', visited: false },
    { id: 'p14', name: 'Park Güell',              type: 'NATURE',     city: 'Barcelona', address: 'Carrer Olot, Barcelona',    notes: '',                  visited: false },
    { id: 'p15', name: 'Mercado de la Boqueria',  type: 'MARKET',     city: 'Barcelona', address: 'La Rambla, 91',             notes: '',                  visited: false },
    { id: 'p16', name: 'Alhambra',                type: 'TEMPLE',     city: 'Granada',   address: 'Calle Real de la Alhambra', notes: '',                  visited: false },
    { id: 'p17', name: 'La Cava del Café',         type: 'BAR',        city: 'Seville',   address: 'Seville',                  notes: '',                  visited: false },
    { id: 'p18', name: 'El Patio',                type: 'RESTAURANT', city: 'Barcelona', address: 'Barcelona',                 notes: '',                  visited: false },
  ],
}

// ── Type config ───────────────────────────────────────────────────────────────

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

const BUILT_IN_TYPES = Object.keys(TYPE_CONFIG) as PlaceType[]

// Falls back to a neutral style for custom types
function getTypeConfig(type: string) {
  return (
    TYPE_CONFIG[type as PlaceType] ?? { label: type, bg: '#f1f5f9', color: '#475569' }
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupPlaces(places: Place[], mode: GroupMode) {
  const key = mode === 'city' ? 'city' : 'type'
  const map: Record<string, Place[]> = {}
  for (const p of places) {
    const k = p[key]
    if (!map[k]) map[k] = []
    map[k].push(p)
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }))
}

// ── Place modal (add & edit) ──────────────────────────────────────────────────

function PlaceModal({
  place,        // null = adding new place
  onSave,
  onClose,
}: {
  place: Place | null
  onSave: (p: Place) => void
  onClose: () => void
}) {
  const [name, setName]               = useState(place?.name    ?? '')
  const [city, setCity]               = useState(place?.city    ?? '')
  const [address, setAddress]         = useState(place?.address ?? '')
  const [type, setType]               = useState(place?.type    ?? 'OTHER')
  const [notes, setNotes]             = useState(place?.notes   ?? '')

  // Custom types added via the "+" pill
  const [customTypes, setCustomTypes] = useState<string[]>([])
  const [addingCustom, setAddingCustom] = useState(false)
  const [newTypeName, setNewTypeName] = useState('')

  const allTypes = [...BUILT_IN_TYPES, ...customTypes]

  function commitCustomType() {
    const trimmed = newTypeName.trim().toUpperCase()
    if (trimmed && !allTypes.includes(trimmed)) {
      setCustomTypes((prev) => [...prev, trimmed])
      setType(trimmed)
    }
    setNewTypeName('')
    setAddingCustom(false)
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      id:      place?.id ?? Date.now().toString(),
      visited: place?.visited ?? false,
      name: name.trim(),
      city: city.trim(),
      address: address.trim(),
      type,
      notes: notes.trim(),
    })
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={m.root}>
        {/* Header */}
        <View style={m.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={m.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={m.title}>{place ? 'Edit Place' : 'New Place'}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[m.save, !name.trim() && m.saveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={m.body} keyboardShouldPersistTaps="handled">
          <Text style={m.label}>Name</Text>
          <TextInput
            style={m.input}
            value={name}
            onChangeText={setName}
            placeholder="Place name"
            placeholderTextColor="#9ca3af"
          />

          <Text style={m.label}>City</Text>
          <TextInput
            style={m.input}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Tokyo"
            placeholderTextColor="#9ca3af"
          />

          <Text style={m.label}>Address / Location</Text>
          <TextInput
            style={m.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address or landmark"
            placeholderTextColor="#9ca3af"
          />

          <Text style={m.label}>Category</Text>
          <View style={m.pills}>
            {allTypes.map((t) => {
              const cfg = getTypeConfig(t)
              const active = t === type
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setType(t)}
                  style={[
                    m.pill,
                    { backgroundColor: cfg.bg },
                    active && { borderColor: cfg.color },
                  ]}
                >
                  <Text style={[m.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                </TouchableOpacity>
              )
            })}

            {/* "+ custom type" pill */}
            {addingCustom ? (
              <TextInput
                style={m.customInput}
                value={newTypeName}
                onChangeText={setNewTypeName}
                placeholder="Type name…"
                placeholderTextColor="#9ca3af"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={commitCustomType}
                onBlur={commitCustomType}
              />
            ) : (
              <TouchableOpacity
                style={m.addPill}
                onPress={() => setAddingCustom(true)}
              >
                <Text style={m.addPillText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={m.label}>Notes</Text>
          <TextInput
            style={[m.input, m.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any notes…"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  )
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>()
  const trip = TRIPS[tripId]

  const [places, setPlaces]       = useState<Place[]>(INITIAL_PLACES[tripId] ?? [])
  const [groupMode, setGroupMode] = useState<GroupMode>('city')
  // null = closed, 'new' = adding, Place = editing
  const [modal, setModal]         = useState<Place | 'new' | null>(null)

  const sections = groupPlaces(places, groupMode)

  function handleSave(updated: Place) {
    setPlaces((prev) => {
      const exists = prev.some((p) => p.id === updated.id)
      return exists
        ? prev.map((p) => (p.id === updated.id ? updated : p))
        : [...prev, updated]
    })
    setModal(null)
  }

  function handleDelete(id: string) {
    setPlaces((prev) => prev.filter((p) => p.id !== id))
  }

  function toggleVisited(id: string) {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, visited: !p.visited } : p)))
  }

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `${trip?.emoji ?? ''} ${trip?.name ?? 'Trip'}`,
          headerBackTitle: 'Back',
        }}
      />

      {/* Toolbar */}
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

      {/* Grouped list */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.list}
        stickySectionHeadersEnabled={false}
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
                onPress={() => toggleVisited(item.id)}
              />
              <View style={s.info}>
                <Text style={[s.name, item.visited && s.nameVisited]}>{item.name}</Text>
                <View style={[s.pill, { backgroundColor: cfg.bg }]}>
                  <Text style={[s.pillText, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity style={s.actionBtn} onPress={() => setModal(item)}>
                  <Text style={s.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={s.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />

      {modal !== null && (
        <PlaceModal
          place={modal === 'new' ? null : modal}
          onSave={handleSave}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f3',
    borderRadius: 20,
    padding: 3,
  },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  toggleActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText:       { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  toggleTextActive: { color: '#111', fontWeight: '700' },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  list: { padding: 16, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title:        { fontSize: 17, fontWeight: '700' },
  cancel:       { fontSize: 16, color: '#6b7280' },
  save:         { fontSize: 16, fontWeight: '700', color: '#2563eb' },
  saveDisabled: { color: '#9ca3af' },
  body:         { padding: 20, paddingBottom: 60 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  pills:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pillText: { fontSize: 13, fontWeight: '600' },
  // "+" pill button
  addPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    backgroundColor: '#f9fafb',
  },
  addPillText: { fontSize: 16, color: '#6b7280', fontWeight: '700' },
  // inline text input that replaces the "+" pill while typing
  customInput: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    fontSize: 13,
    color: '#111',
    minWidth: 100,
  },
})
