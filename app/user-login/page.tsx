'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { userLogin, getRestaurantsForSelector } from '@/app/actions/user-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Restaurant {
  id: number
  name: string
}

export default function UserLoginPage() {
  const router = useRouter()
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [restaurantsLoading, setRestaurantsLoading] = useState(true)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = await getRestaurantsForSelector()
        setRestaurants(data)
        if (data.length > 0) {
          setRestaurantId(data[0].id.toString())
        }
      } catch (err) {
        console.error('[v0] Error loading restaurants:', err)
      } finally {
        setRestaurantsLoading(false)
      }
    }

    loadRestaurants()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!restaurantId) {
      setError('Please select a restaurant')
      setLoading(false)
      return
    }

    try {
      const result = await userLogin(parseInt(restaurantId), email, password)
      if (result.success) {
        router.push('/user/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  if (restaurantsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Staff Login</CardTitle>
          <CardDescription>
            Select your restaurant and enter your credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}

            {restaurants.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700 text-sm">
                No restaurants available. Please contact an administrator.
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="restaurant" className="block text-sm font-medium">
                    Restaurant
                  </label>
                  <select
                    id="restaurant"
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {restaurants.map((restaurant) => (
                      <option key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="staff@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </>
            )}
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Admin?{' '}
              <Link href="/admin-login" className="text-primary hover:underline">
                Admin Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
