import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getRestaurant, getCategories, getMenuItems } from '@/app/actions/restaurants'
import { RestaurantEditor } from '@/components/admin/restaurant-editor'
import { MenuManager } from '@/components/admin/menu-manager'

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const restaurantId = parseInt(params.id)
  const restaurant = await getRestaurant(restaurantId)

  if (!restaurant) {
    notFound()
  }

  const categories = await getCategories(restaurantId)
  const menuItems = await getMenuItems(restaurantId)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <RestaurantEditor restaurant={restaurant} />
        
        <div className="mt-8">
          <MenuManager 
            restaurant={restaurant}
            categories={categories}
            menuItems={menuItems}
          />
        </div>
      </div>
    </div>
  )
}
