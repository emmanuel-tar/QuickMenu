'use client'

import Image from 'next/image'
import Link from 'next/link'
import { restaurants } from '@/lib/db/schema'
import { InferSelectModel } from 'drizzle-orm'

type Restaurant = InferSelectModel<typeof restaurants>

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/admin/restaurants/${restaurant.id}`}>
      <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg">
        {restaurant.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={restaurant.imageUrl}
              alt={restaurant.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
            {restaurant.name}
          </h3>
          
          {restaurant.cuisineType && (
            <p className="text-sm text-muted-foreground">{restaurant.cuisineType}</p>
          )}
          
          {restaurant.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {restaurant.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className={`text-xs font-medium ${
              restaurant.isActive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {restaurant.isActive ? '● Active' : '● Inactive'}
            </span>
            
            {restaurant.qrCode && (
              <div className="h-12 w-12 overflow-hidden rounded border border-border bg-white">
                <Image
                  src={restaurant.qrCode}
                  alt="QR Code"
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
