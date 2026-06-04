'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAdminSession, adminLogout } from '@/app/actions/admin-auth'
import { getRestaurants } from '@/app/actions/restaurants'
import { getUsersForRestaurant } from '@/app/actions/user-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ManageUsersDialog } from '@/components/admin/manage-users-dialog'
import Link from 'next/link'

interface AdminSession {
  id: number
  email: string
  name: string | null
}

interface Restaurant {
  id: number
  name: string
  description: string | null
  cuisineType: string | null
  restaurantUrl: string | null
  isActive: boolean
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const session = await getAdminSession()
        if (!session) {
          router.push('/admin-login')
          return
        }
        setAdmin(session)

        const restaurantList = await getRestaurants()
        setRestaurants(restaurantList)
      } catch (error) {
        console.error('[v0] Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  async function handleLogout() {
    try {
      await adminLogout()
      router.push('/admin-login')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">QuickMenu Admin</h1>
            <p className="text-sm text-muted-foreground">{admin.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Manage restaurants and their staff accounts
          </p>
        </div>

        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground mb-4">
                No restaurants found. Only restaurant owners can create restaurants through the main app.
              </p>
              <div className="text-center">
                <Link href="/">
                  <Button variant="outline">Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {restaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                      {restaurant.description && (
                        <CardDescription>{restaurant.description}</CardDescription>
                      )}
                      {restaurant.cuisineType && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Cuisine: {restaurant.cuisineType}
                        </p>
                      )}
                    </div>
                    <ManageUsersDialog restaurantId={restaurant.id} restaurantName={restaurant.name} />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
