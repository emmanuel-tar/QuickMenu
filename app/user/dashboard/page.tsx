'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUserSession, userLogout } from '@/app/actions/user-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface UserSession {
  id: number
  email: string
  name: string | null
  restaurantId: number
  restaurantName: string
}

export default function UserDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await getUserSession()
        if (!session) {
          router.push('/user-login')
          return
        }
        setUser(session)
      } catch (error) {
        console.error('[v0] Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [router])

  async function handleLogout() {
    try {
      await userLogout()
      router.push('/user-login')
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">QuickMenu</h1>
            <p className="text-sm text-muted-foreground">{user.restaurantName}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, {user.name || user.email}</h2>
          <p className="text-muted-foreground">
            You are logged in to: <span className="font-semibold">{user.restaurantName}</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>View Menu</CardTitle>
              <CardDescription>
                See how your restaurant&apos;s menu looks to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/menu/${user.restaurantId}`}>
                <Button className="w-full">View Menu</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Menu</CardTitle>
              <CardDescription>
                Edit items, categories, and pricing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/admin/restaurants/${user.restaurantId}`}>
                <Button className="w-full">Manage Menu</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Restaurant Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Account Created</p>
              <p className="font-medium">Staff Account</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Access Level</p>
              <p className="font-medium">Staff Member</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
