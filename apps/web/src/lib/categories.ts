import type { PlaceType } from '@holiday-planner/shared'

export interface CustomCategory {
  id: string
  name: string
  emoji: string
}

export interface CategoryConfig {
  label: string
  emoji: string
  color: string
  bg: string
}

export const BUILT_IN_TYPES: PlaceType[] = [
  'RESTAURANT', 'MUSEUM', 'HIKE', 'HOTEL', 'NATURE',
  'TEMPLE', 'BEACH', 'MARKET', 'BAR', 'SHOP', 'OTHER',
]

export const CATEGORY_CONFIG: Record<PlaceType, CategoryConfig> = {
  RESTAURANT: { label: 'Restaurant', emoji: '🍽️', color: '#ef4444', bg: '#fff7ed' },
  MUSEUM:     { label: 'Museum',     emoji: '🏛️', color: '#8b5cf6', bg: '#f5f3ff' },
  HIKE:       { label: 'Hike',       emoji: '🥾', color: '#10b981', bg: '#f0fdf4' },
  HOTEL:      { label: 'Hotel',      emoji: '🏨', color: '#3b82f6', bg: '#ecfeff' },
  NATURE:     { label: 'Nature',     emoji: '🌿', color: '#22c55e', bg: '#f0fdf4' },
  TEMPLE:     { label: 'Temple',     emoji: '⛩️', color: '#f97316', bg: '#fffbeb' },
  BEACH:      { label: 'Beach',      emoji: '🏖️', color: '#06b6d4', bg: '#eff6ff' },
  MARKET:     { label: 'Market',     emoji: '🛒', color: '#eab308', bg: '#fdf4ff' },
  BAR:        { label: 'Bar',        emoji: '🍺', color: '#f59e0b', bg: '#fff1f2' },
  SHOP:       { label: 'Shop',       emoji: '🛍️', color: '#ec4899', bg: '#fdf2f8' },
  OTHER:      { label: 'Other',      emoji: '📍', color: '#6b7280', bg: '#f9fafb' },
}

export function getCategoryConfig(
  type: string,
  customCategories: CustomCategory[] = []
): CategoryConfig {
  if (type in CATEGORY_CONFIG) return CATEGORY_CONFIG[type as PlaceType]
  const custom = customCategories.find(
    (c) => c.name.toUpperCase() === type.toUpperCase()
  )
  if (custom) return { label: custom.name, emoji: custom.emoji, color: '#6b7280', bg: '#f1f5f9' }
  return CATEGORY_CONFIG.OTHER
}

const TRIP_EMOJIS = ['🗺️', '✈️', '🧳', '🏖️', '🏔️', '🌍', '🏛️', '🌆', '🎌', '🏝️']
export function tripEmoji(id: string): string {
  const n = id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return TRIP_EMOJIS[n % TRIP_EMOJIS.length]
}
