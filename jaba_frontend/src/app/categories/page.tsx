'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createActor } from '@/utils/actor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import toast from "react-hot-toast"
import { 
  PlusCircle, 
  Layers, 
  FolderPlus, 
  Loader2, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react'

interface Category {
  id: string;
  name: string;
}

interface Actor {
  getCategories: () => Promise<{ Ok?: Category[] }>;
  createCategory: (name: string) => Promise<{ Ok?: Category }>;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const actor = await createActor()
      const result = await actor.getCategories()
      
      if (result) {
        /* Sort categories alphabetically
        const sortedCategories: Category[] = result.sort((a: Category, b: Category) => 
          a.name.localeCompare(b.name)
        ) || []*/
        setCategories(result)
      } else {
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast("Failed to fetch categories", { icon: '❌' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate category name
    const trimmedCategory = newCategory.trim()
    if (!trimmedCategory) {
      toast("Category name cannot be empty.", { icon: '❌' })
      return
    }

    if (trimmedCategory.length < 2) {
      toast("Category name must be at least 2 characters long.", { icon: '❌' })
      return
    }

    // Check for duplicate category
    if (categories.some(cat => cat.name.toLowerCase() === trimmedCategory.toLowerCase())) {
      toast("Category already exists.", { icon: '❌' })
      return
    }

    setIsSubmitting(true)
    try {
      const actor: Actor = await createActor()
      const result = await actor.createCategory(trimmedCategory)
      
      if ('Ok' in result && result.Ok) {
        toast("Category created successfully", { icon: <CheckCircle2 className="text-emerald-500" /> })
        setNewCategory('')
        await fetchCategories()
      } else {
        throw new Error('Category creation failed')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast("Failed to create category", { icon: <XCircle className="text-red-500" /> })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent rendering on the server
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-emerald-800 
        animate-gradient-x bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 
        bg-clip-text text-transparent">
        Categories Management
      </h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Categories List Card */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-xl font-bold text-emerald-800 flex items-center">
              <Layers className="mr-2 h-6 w-6 text-emerald-600" />
              All Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="ml-2 text-emerald-800">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p>No categories found.</p>
                <p className="text-sm">Create your first category!</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {categories.map((category) => (
                  <li key={category.id} className="group">
                    <Link 
                      href={`/categories/${category.id}`} 
                      className="block p-2 rounded-lg 
                        text-emerald-800 hover:bg-emerald-100 
                        transition-colors duration-200 
                        flex items-center justify-between"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        View
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="bg-emerald-50 border-t border-emerald-100 text-xs text-gray-500 p-4 text-center">
            {categories.length} categorie{categories.length !== 1 && 's'} total
          </CardFooter>
        </Card>

        {/* Create Category Card */}
        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-xl font-bold text-emerald-800 flex items-center">
              <FolderPlus className="mr-2 h-6 w-6 text-emerald-600" />
              Create New Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter category name"
                className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                  transition-all duration-300"
                required
                disabled={isSubmitting}
              />
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 
                  transition-colors text-white font-semibold py-3 rounded-lg 
                  shadow-md hover:shadow-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Category
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}