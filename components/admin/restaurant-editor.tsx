'use client'

import { useState } from 'react'
import { restaurants } from '@/lib/db/schema'
import { InferSelectModel } from 'drizzle-orm'
import { updateRestaurant, deleteRestaurant } from '@/app/actions/restaurants'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type Restaurant = InferSelectModel<typeof restaurants>

export function RestaurantEditor({ restaurant }: { restaurant: Restaurant }) {
  const [name, setName] = useState(restaurant.name)
  const [description, setDescription] = useState(restaurant.description || '')
  const [cuisineType, setCuisineType] = useState(restaurant.cuisineType || '')
  const [isActive, setIsActive] = useState(restaurant.isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpdate() {
    setLoading(true)
    try {
      await updateRestaurant(restaurant.id, {
        name,
        description,
        cuisineType,
        isActive,
      })
      alert('Restaurant updated successfully')
    } catch (error) {
      console.error('Error updating restaurant:', error)
      alert('Failed to update restaurant')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this restaurant? This cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      await deleteRestaurant(restaurant.id)
      router.push('/admin')
    } catch (error) {
      console.error('Error deleting restaurant:', error)
      alert('Failed to delete restaurant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{restaurant.name}</h1>
          <p className="mt-2 text-muted-foreground">Edit restaurant details and manage menu</p>
        </div>
        
        <Link href={`/menu/${restaurant.restaurantUrl}`} target="_blank">
          <button className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90">
            View Menu
          </button>
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">Restaurant Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">Cuisine Type</label>
            <input
              type="text"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <label className="text-sm font-medium text-foreground">Active</label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Delete Restaurant
          </button>
        </div>
      </div>

      {restaurant.qrCode && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">QR Code</h2>
          <div className="flex items-center gap-4">
            <Image
              src={restaurant.qrCode}
              alt="QR Code"
              width={200}
              height={200}
              className="border border-border p-2"
            />
            <div>
              <p className="text-sm text-muted-foreground">
                Share this QR code so customers can access your menu
              </p>
              <p className="mt-2 break-all rounded-lg bg-muted p-2 text-sm font-mono text-foreground">
                {`${process.env.NEXT_PUBLIC_APP_URL || 'https://quickmenu.app'}/menu/${restaurant.restaurantUrl}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
