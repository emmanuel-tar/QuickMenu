import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getRestaurants } from '@/app/actions/restaurants'
import { CreateRestaurantDialog } from '@/components/admin/create-restaurant-dialog'
import { RestaurantCard } from '@/components/admin/restaurant-card'

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  
  if (!session?.user) {
    redirect('/sign-in')
  }

  const userRestaurants = await getRestaurants()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Restaurants</h1>
            <p className="mt-2 text-muted-foreground">Manage your restaurant menus and QR codes</p>
          </div>
          <CreateRestaurantDialog />
        </div>

        {userRestaurants.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">No restaurants yet. Create your first one!</p>
            <CreateRestaurantDialog />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {userRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
