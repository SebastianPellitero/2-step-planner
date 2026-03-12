import { View, Text, StyleSheet } from 'react-native'

export default function PlanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Places</Text>
      <Text style={styles.subtitle}>Place list, trips and filters coming soon.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
})
