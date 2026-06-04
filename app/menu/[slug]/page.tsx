import { db } from '@/lib/db'
import { restaurants, menuCategories, menuItems } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { MenuViewer } from '@/components/menu/menu-viewer'

export default async function MenuPage({ params }: { params: { slug: string } }) {
  const restaurant = await db
    .select()
    .from(restaurants)
    .where(eq(restaurants.restaurantUrl, params.slug))
    .limit(1)

  if (!restaurant || restaurant.length === 0) {
    notFound()
  }

  const restaurantData = restaurant[0]
  if (!restaurantData.isActive) {
    notFound()
  }

  const categories = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.restaurantId, restaurantData.id))
    .orderBy(menuCategories.displayOrder)

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.restaurantId, restaurantData.id))
    .orderBy(menuItems.displayOrder)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      <MenuViewer 
        restaurant={restaurantData}
        categories={categories}
        items={items}
      />
    </div>
  )
}
