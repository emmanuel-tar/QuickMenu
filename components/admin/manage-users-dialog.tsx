'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  getUsersForRestaurant,
  createUserAccount,
  deactivateUserAccount,
} from '@/app/actions/user-auth'

interface User {
  id: number
  email: string
  name: string | null
  isActive: boolean
}

interface ManageUsersDialogProps {
  restaurantId: number
  restaurantName: string
}

export function ManageUsersDialog({
  restaurantId,
  restaurantName,
}: ManageUsersDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getUsersForRestaurant(restaurantId)
      setUsers(data)
    } catch (err) {
      console.error('[v0] Error loading users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    try {
      const result = await createUserAccount(
        restaurantId,
        formData.email,
        formData.password,
        formData.name
      )

      if (result.success) {
        setSuccess('User created successfully!')
        setFormData({ email: '', password: '', name: '' })
        setShowForm(false)
        await loadUsers()
      } else {
        setError(result.error || 'Failed to create user')
      }
    } catch (err) {
      console.error('[v0] Error creating user:', err)
      setError('An error occurred')
    }
  }

  async function handleDeactivateUser(userId: number) {
    if (!confirm('Are you sure you want to deactivate this user?')) {
      return
    }

    try {
      const result = await deactivateUserAccount(userId)
      if (result.success) {
        setSuccess('User deactivated successfully!')
        await loadUsers()
      } else {
        setError(result.error || 'Failed to deactivate user')
      }
    } catch (err) {
      console.error('[v0] Error deactivating user:', err)
      setError('An error occurred')
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline">
        Manage Staff
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Manage Staff</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {restaurantName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsOpen(false)
                    setShowForm(false)
                    setFormData({ email: '', password: '', name: '' })
                    setError('')
                    setSuccess('')
                  }}
                >
                  ✕
                </Button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
                  {success}
                </div>
              )}

              {/* Users List */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Current Staff</h3>
                {loading ? (
                  <p className="text-muted-foreground">Loading users...</p>
                ) : users.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No staff accounts created yet</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border border-border rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{user.name || 'No Name'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {!user.isActive && (
                            <p className="text-xs text-red-600 mt-1">Deactivated</p>
                          )}
                        </div>
                        {user.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create User Form */}
              <div className="border-t pt-6">
                {!showForm ? (
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    + Add New Staff Member
                  </Button>
                ) : (
                  <div>
                    <h3 className="font-semibold mb-4">Create New Staff Account</h3>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Name
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          placeholder="staff@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Password
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button type="submit" className="flex-1">
                          Create Account
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowForm(false)
                            setFormData({ email: '', password: '', name: '' })
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
