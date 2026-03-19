import { getCategoryConfig } from '@/lib/categories'
import type { CustomCategory } from '@/lib/categories'

interface Props {
  type: string
  customCategories?: CustomCategory[]
}

export function CategoryPill({ type, customCategories = [] }: Props) {
  const { label, color, bg } = getCategoryConfig(type, customCategories)
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '99px',
      fontSize: '0.75rem', fontWeight: 600, background: bg, color,
    }}>
      {label}
    </span>
  )
}
