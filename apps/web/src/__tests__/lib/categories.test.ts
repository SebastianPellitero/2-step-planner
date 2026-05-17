import { describe, it, expect } from 'vitest'
import {
  getCategoryConfig,
  CATEGORY_CONFIG,
  BUILT_IN_TYPES,
  tripEmoji,
} from '@/lib/categories'

describe('CATEGORY_CONFIG', () => {
  it('has entries for all 11 built-in types', () => {
    expect(BUILT_IN_TYPES).toHaveLength(11)
    for (const type of BUILT_IN_TYPES) {
      expect(CATEGORY_CONFIG).toHaveProperty(type)
    }
  })

  it('every entry has emoji, color, bg and label', () => {
    for (const cfg of Object.values(CATEGORY_CONFIG)) {
      expect(cfg.emoji).toBeTruthy()
      expect(cfg.color).toMatch(/^#/)
      expect(cfg.bg).toMatch(/^#/)
      expect(cfg.label).toBeTruthy()
    }
  })
})

describe('getCategoryConfig', () => {
  it('returns correct config for built-in types', () => {
    expect(getCategoryConfig('RESTAURANT').emoji).toBe('🍽️')
    expect(getCategoryConfig('MUSEUM').emoji).toBe('🏛️')
    expect(getCategoryConfig('BEACH').emoji).toBe('🏖️')
    expect(getCategoryConfig('TEMPLE').emoji).toBe('⛩️')
  })

  it('falls back to OTHER for unknown type', () => {
    const cfg = getCategoryConfig('UNKNOWN_TYPE')
    expect(cfg).toEqual(CATEGORY_CONFIG.OTHER)
  })

  it('resolves a custom category by name (case-insensitive)', () => {
    const custom = [{ id: 'c1', name: 'Bakery', emoji: '🥐' }]
    const cfg = getCategoryConfig('BAKERY', custom)
    expect(cfg.emoji).toBe('🥐')
    expect(cfg.label).toBe('Bakery')
  })

  it('custom category lookup is case-insensitive', () => {
    const custom = [{ id: 'c1', name: 'Coffee Shop', emoji: '☕' }]
    expect(getCategoryConfig('coffee shop', custom).emoji).toBe('☕')
    expect(getCategoryConfig('COFFEE SHOP', custom).emoji).toBe('☕')
  })

  it('falls back to OTHER when custom category not found', () => {
    const custom = [{ id: 'c1', name: 'Bakery', emoji: '🥐' }]
    const cfg = getCategoryConfig('Pharmacy', custom)
    expect(cfg).toEqual(CATEGORY_CONFIG.OTHER)
  })

  it('prefers built-in over custom when type matches a built-in', () => {
    const custom = [{ id: 'c1', name: 'RESTAURANT', emoji: '🍕' }]
    const cfg = getCategoryConfig('RESTAURANT', custom)
    expect(cfg.emoji).toBe('🍽️') // built-in wins
  })
})

describe('tripEmoji', () => {
  it('returns a non-empty string', () => {
    expect(typeof tripEmoji('abc')).toBe('string')
    expect(tripEmoji('abc').length).toBeGreaterThan(0)
  })

  it('is deterministic — same ID always returns same emoji', () => {
    expect(tripEmoji('trip-123')).toBe(tripEmoji('trip-123'))
    expect(tripEmoji('abc')).toBe(tripEmoji('abc'))
  })

  it('returns different emojis for different IDs (statistically)', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `trip-${i}`)
    const emojis = new Set(ids.map(tripEmoji))
    expect(emojis.size).toBeGreaterThan(1) // not all the same
  })

  it('handles empty string without throwing', () => {
    expect(() => tripEmoji('')).not.toThrow()
  })
})
