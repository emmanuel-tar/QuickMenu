'use client'

import { useState } from 'react'
import { restaurants, menuCategories, menuItems } from '@/lib/db/schema'
import { InferSelectModel } from 'drizzle-orm'
import { createCategory, createMenuItem, updateMenuItem, deleteMenuItem, deleteCategory } from '@/app/actions/restaurants'
import { useRouter } from 'next/navigation'

type Restaurant = InferSelectModel<typeof restaurants>
type Category = InferSelectModel<typeof menuCategories>
type MenuItem = InferSelectModel<typeof menuItems>

interface MenuManagerProps {
  restaurant: Restaurant
  categories: Category[]
  menuItems: MenuItem[]
}

export function MenuManager({ restaurant, categories, menuItems }: MenuManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set())
  const router = useRouter()

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return

    try {
      await createCategory(restaurant.id, { name: newCategoryName })
      setNewCategoryName('')
      router.refresh()
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category')
    }
  }

  async function handleDeleteCategory(categoryId: number) {
    if (!confirm('Delete this category? Items will not be deleted.')) return

    try {
      await deleteCategory(categoryId)
      router.refresh()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Failed to delete category')
    }
  }

  async function handleAddMenuItem(categoryId: number) {
    const name = prompt('Item name:')
    if (!name) return

    const price = prompt('Price:')
    if (!price) return

    try {
      await createMenuItem(restaurant.id, categoryId, {
        name,
        price,
      })
      router.refresh()
    } catch (error) {
      console.error('Error creating menu item:', error)
      alert('Failed to create menu item')
    }
  }

  async function handleDeleteMenuItem(menuItemId: number) {
    if (!confirm('Delete this item?')) return

    try {
      await deleteMenuItem(menuItemId)
      router.refresh()
    } catch (error) {
      console.error('Error deleting menu item:', error)
      alert('Failed to delete menu item')
    }
  }

  async function handleToggleAvailability(item: MenuItem) {
    try {
      await updateMenuItem(item.id, { isAvailable: !item.isAvailable })
      router.refresh()
    } catch (error) {
      console.error('Error updating menu item:', error)
      alert('Failed to update menu item')
    }
  }

  const toggleCategory = (categoryId: number) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId)
    } else {
      newSet.add(categoryId)
    }
    setExpandedCategories(newSet)
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-6 text-2xl font-bold text-foreground">Menu</h2>

      <div className="mb-6 space-y-4">
        {categories.map((category) => {
          const categoryItems = menuItems.filter((item) => item.categoryId === category.id)
          const isExpanded = expandedCategories.has(category.id)

          return (
            <div key={category.id} className="border border-border rounded-lg overflow-hidden">
              <div
                className="flex cursor-pointer items-center justify-between bg-muted px-4 py-3 hover:bg-muted/80"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-foreground">{category.name}</span>
                  <span className="text-sm text-muted-foreground">({categoryItems.length} items)</span>
                </div>
                <span className="text-xl text-muted-foreground">{isExpanded ? '−' : '+'}</span>
              </div>

              {isExpanded && (
                <div className="space-y-3 p-4">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-input bg-background p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.name}</span>
                          {!item.isAvailable && (
                            <span className="text-xs font-semibold text-red-600">UNAVAILABLE</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <div className="mt-1 flex items-center gap-3 text-sm">
                          <span className="font-semibold text-foreground">${item.price}</span>
                          {item.oldPrice && (
                            <span className="line-through text-muted-foreground">${item.oldPrice}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className={`rounded px-3 py-1 text-xs font-medium ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                          }`}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </button>

                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddMenuItem(category.id)}
                    className="w-full rounded-lg border-2 border-dashed border-border px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary"
                  >
                    + Add Item
                  </button>
                </div>
              )}

              <div className="border-t border-border px-4 py-2">
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Delete Category
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-3 rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <label className="text-sm font-medium text-foreground">Add New Category</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g., Appetizers, Main Courses"
            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
