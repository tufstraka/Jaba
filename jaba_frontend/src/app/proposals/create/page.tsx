'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createActor } from '@/utils/actor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPrincipal } from '@/utils/actor'
import toast from 'react-hot-toast'

interface User {
  principal: { toText: () => string }
}

export default function CreateProposalPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [endTime, setEndTime] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [ user, setUser ] = useState<User | null>(null)

  const router = useRouter()

  useEffect(() => {
    const fetchCategories = async () => {
      const actor = await createActor()
      try {
        const result = await actor.getCategories()
        if (result) {
          setCategories(result)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
    fetchUser()
  }, [])

  interface Category {
    id: number;
    name: string;
  }

  interface CreateProposalResult {
    Ok?: any;
    Err?: any;
  }

  const fetchUser = async () => {
    const result = await getPrincipal()
    console.log('result in proposal create:', result)
    setUser(result as User)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const actor = await createActor()
    try {
      const result: CreateProposalResult = await actor.createProposal(title, description, categoryId, user?.principal.toText())
      console.log('result in proposal create:', result)
      if ('Ok' in result) {
        toast("Proposal created successfully", { icon: '✅' })
        router.push('/proposals')
      }
    } catch (error) {
      console.error('Error creating proposal:', error)
      toast("Failed to create proposal", { icon: '❌' })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Proposal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Proposal Title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Proposal Description"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time (Optional)</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">Create Proposal</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

