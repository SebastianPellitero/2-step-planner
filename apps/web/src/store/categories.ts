import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CustomCategory } from '@/lib/categories'

interface CategoryState {
  customCategories: CustomCategory[]
  addCategory: (name: string, emoji: string) => void
  updateCategory: (id: string, updates: Partial<Omit<CustomCategory, 'id'>>) => void
  deleteCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set) => ({
      customCategories: [],

      addCategory: (name, emoji) =>
        set((s) => ({
          customCategories: [
            ...s.customCategories,
            { id: crypto.randomUUID(), name: name.trim(), emoji },
          ],
        })),

      updateCategory: (id, updates) =>
        set((s) => ({
          customCategories: s.customCategories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          customCategories: s.customCategories.filter((c) => c.id !== id),
        })),
    }),
    { name: 'categories' }
  )
)
