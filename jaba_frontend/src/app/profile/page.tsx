'use client'

import { useState, useEffect } from 'react'
import { createActor } from '@/utils/actor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [newName, setNewName] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const actor = await createActor()
    try {
      const result = await actor.getUser()
      if ('Ok' in result) {
        setUser(result.Ok)
        setNewName(result.Ok.name)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  interface User {
    id: {
      toText: () => string;
    };
    name: string;
    email: string;
  }

  interface Result<T> {
    Ok?: T;
    Err?: string;
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const actor = await createActor()
    try {
      const result: Result<null> = await actor.updateUser(newName)
      if ('Ok' in result) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })
        fetchUser()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (!user) {
    return <div>Loading profile...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Your Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">User ID: {user.id.toText()}</p>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Update Profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

