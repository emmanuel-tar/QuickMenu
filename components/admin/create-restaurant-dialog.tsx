'use client'

import { useState } from 'react'
import { createRestaurant } from '@/app/actions/restaurants'
import { useRouter } from 'next/navigation'

export function CreateRestaurantDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const restaurant = await createRestaurant({
        name,
        description,
        cuisineType,
      })

      router.push(`/admin/restaurants/${restaurant.id}`)
      setOpen(false)
    } catch (error) {
      console.error('Error creating restaurant:', error)
      alert('Failed to create restaurant')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
      >
        + New Restaurant
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-foreground">Create New Restaurant</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Restaurant Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              placeholder="e.g., Pizza Palace"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              placeholder="Tell customers about your restaurant"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              Cuisine Type
            </label>
            <input
              type="text"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground"
              placeholder="e.g., Italian, Asian, Mediterranean"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg border border-input px-4 py-2 text-foreground hover:bg-accent"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={loading || !name}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
