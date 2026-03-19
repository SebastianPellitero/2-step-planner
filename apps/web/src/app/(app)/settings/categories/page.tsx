import { CategoryManager } from '@/components/categories/CategoryManager'

export default function CategoriesPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111', marginBottom: '0.25rem' }}>
        Categories
      </h1>
      <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Manage the categories used to tag your places. Custom categories can use any emoji.
      </p>
      <CategoryManager />
    </div>
  )
}
