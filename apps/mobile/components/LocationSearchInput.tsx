import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import type { LocationResult } from '@holiday-planner/shared'
import { locationProvider } from '../lib/location'

interface Props {
  /** Current address string shown in the input */
  value: string
  /** Called when the user selects a result from the dropdown */
  onSelect: (result: LocationResult) => void
  placeholder?: string
}

export function LocationSearchInput({ value, onSelect, placeholder }: Props) {
  const [query, setQuery]           = useState(value)
  const [results, setResults]       = useState<LocationResult[]>([])
  const [loading, setLoading]       = useState(false)
  const debounceRef                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChangeText(text: string) {
    setQuery(text)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (text.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await locationProvider.search(text, { limit: 5 })
        setResults(res)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
  }

  function handleSelect(result: LocationResult) {
    setQuery(result.address)
    setResults([])
    onSelect(result)
  }

  return (
    <View>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder ?? 'Search for a place…'}
          placeholderTextColor="#9ca3af"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color="#2563eb" style={s.spinner} />}
      </View>

      {results.length > 0 && (
        <View style={s.dropdown}>
          {results.map((r, i) => (
            <TouchableOpacity
              key={r.placeId}
              style={[s.result, i < results.length - 1 && s.resultBorder]}
              onPress={() => handleSelect(r)}
              activeOpacity={0.7}
            >
              <Text style={s.resultName} numberOfLines={1}>{r.name}</Text>
              <Text style={s.resultAddress} numberOfLines={1}>{r.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111',
  },
  spinner: {
    marginRight: 12,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  result: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  resultBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 12,
    color: '#6b7280',
  },
})
