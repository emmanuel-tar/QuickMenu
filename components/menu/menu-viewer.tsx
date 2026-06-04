'use client'

import { useState } from 'react'
import Image from 'next/image'
import { restaurants, menuCategories, menuItems } from '@/lib/db/schema'
import { InferSelectModel } from 'drizzle-orm'

type Restaurant = InferSelectModel<typeof restaurants>
type Category = InferSelectModel<typeof menuCategories>
type MenuItem = InferSelectModel<typeof menuItems>

interface MenuViewerProps {
  restaurant: Restaurant
  categories: Category[]
  items: MenuItem[]
}

export function MenuViewer({ restaurant, categories, items }: MenuViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null
  )

  const filteredItems = items.filter((item) => item.categoryId === selectedCategory)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-end justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground">{restaurant.name}</h1>
              {restaurant.cuisineType && (
                <p className="mt-2 text-lg text-muted-foreground">{restaurant.cuisineType}</p>
              )}
              {restaurant.description && (
                <p className="mt-3 text-muted-foreground">{restaurant.description}</p>
              )}
            </div>

            {restaurant.imageUrl && (
              <div className="hidden flex-shrink-0 md:block">
                <Image
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto py-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-12">
        {filteredItems.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No items available in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border border-border bg-card p-6 transition-opacity ${
                  !item.isAvailable ? 'opacity-60' : ''
                }`}
              >
                <div className="flex gap-6">
                  {item.imageUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="mt-1 inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800 dark:bg-red-900 dark:text-red-100">
                            Currently Unavailable
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-2xl font-bold text-primary">
                          ${item.price}
                        </span>
                        {item.oldPrice && (
                          <span className="text-sm line-through text-muted-foreground">
                            ${item.oldPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.description && (
                      <p className="mt-3 text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by QuickMenu - Digital Menu System</p>
        </div>
      </div>
    </div>
  )
}
