import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

const TRIPS = [
  { id: '1', name: 'Japan',   emoji: '🗾', count: 5 },
  { id: '2', name: 'Greece',  emoji: '🏛️', count: 3 },
  { id: '3', name: 'Germany', emoji: '🏰', count: 4 },
  { id: '4', name: 'Spain',   emoji: '🌞', count: 6 },
]

export default function PlanScreen() {
  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" />

      <View style={s.header}>
        <Text style={s.headerTitle}>Wishlist</Text>
        <TouchableOpacity style={s.newBtn}>
          <Text style={s.newBtnText}>+ Trip</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.subtitle}>Places to go</Text>

      <FlatList
        data={TRIPS}
        numColumns={2}
        keyExtractor={(t) => t.id}
        columnWrapperStyle={s.row}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.card}
            activeOpacity={0.75}
            onPress={() => router.push(`/trip/${item.id}`)}
          >
            <Text style={s.cardEmoji}>{item.emoji}</Text>
            <Text style={s.cardName}>{item.name}</Text>
            <Text style={s.cardCount}>{item.count} places</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
  },
  newBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  list: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    minHeight: 130,
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
})
