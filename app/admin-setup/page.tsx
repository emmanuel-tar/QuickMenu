'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { setupAdmin } from '@/app/actions/setup-admin'

export default function AdminSetupPage() {
  const [showQuickSetup, setShowQuickSetup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuickSetup = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const result = await setupAdmin()
      if (result.success) {
        setMessage({
          type: 'success',
          text: `${result.message} You can now login at /admin-login with the credentials shown above.`,
        })
        setTimeout(() => {
          window.location.href = '/admin-login'
        }, 3000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create admin account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create admin account' })
      console.error('[v0] Setup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Admin account created! You can now login at /admin-login`,
        })
        setFormData({ name: '', email: '', password: '', confirmPassword: '' })
        // Redirect after success
        setTimeout(() => {
          window.location.href = '/admin-login'
        }, 2000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create admin account' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
      console.error('[v0] Setup error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <CardDescription>Create your first admin account</CardDescription>
        </CardHeader>
        <CardContent>
          {!showQuickSetup ? (
            <div className="space-y-4">
              <Button
                type="button"
                onClick={handleQuickSetup}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Creating...' : 'Quick Setup (Emmanuel Account)'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or create custom account</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setShowQuickSetup(true)}
                className="w-full"
                variant="ghost"
              >
                Continue with Custom Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Emmanuel"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g., admin@qmenu.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create Admin Account'}
            </Button>

            <Button
              type="button"
              onClick={() => setShowQuickSetup(false)}
              variant="ghost"
              className="w-full"
            >
              Back to Quick Setup
            </Button>
          </form>
          )}

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/admin-login" className="text-primary hover:underline">
              Login here
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
