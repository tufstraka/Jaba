'use client'

import { useState, useEffect } from 'react'
import { createActor, getPrincipal, login, logout } from '../utils/actor'
import UserProfile from '@/components/UserProfile'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import RecentProposals from '@/components/RecentProposals'
import { User, Lock, Mail, CheckCircle, VoteIcon, Globe } from 'lucide-react'

interface User {
  principal: { toText: () => string }
}

interface Category {
  id: string
  name: string
}

export default function Home() {
  const [actor, setActor] = useState<any>(null)
  const [user, setUser] = useState<User | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const { toast } = useToast()

  // Registration State
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
  })

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  useEffect(() => {
    const initActor = async () => {
      try {
        const newActor = await createActor()
        setActor(newActor)
        setLoading(false)
      } catch (error) {
        console.error('Error initializing actor:', error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize the application. Please refresh.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }
    initActor()
  }, [])

  useEffect(() => {
    if (actor) {
      fetchUser()
      fetchCategories()
    }
  }, [actor])

  const fetchUser = async () => {
    try {
      const result = await getPrincipal()
      if (result) {
        setUser(result as User)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchCategories = async () => {
    try {
      const result = await actor.getCategories();
      if ('Ok' in result) {
        setCategories(result.Ok)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Failed to fetch categories. Please try again.",
        variant: "destructive",
      })
    }
  }
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced input validation
    const nameError = !registrationData.name || registrationData.name.trim().length < 2
    const emailError = !registrationData.email || !/\S+@\S+\.\S+/.test(registrationData.email)

    if (nameError || emailError) {
      toast({
        title: "Validation Error",
        description: nameError 
          ? "Please enter a valid full name (at least 2 characters)." 
          : "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const success = await login(registrationData.name, registrationData.email)
      
      if (success) {
        const newActor = await createActor()
        setActor(newActor)
        
        toast({
          title: "Logged in",
          description: `Welcome, ${registrationData.name}!`,
        })
      } else {
        toast({
          title: "Login failed",
          description: "Failed to log in. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during login.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setActor(null)
      toast({
        title: "Logged out",
        description: "You have been logged out.",
      })
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      })
    }
  }

  const handleCreateCategory = async (name: string) => {
    try {
      const result = await actor.createCategory(name)
      if ('Ok' in result) {
        fetchCategories()
        toast({
          title: "Category created",
          description: "New category has been created successfully.",
        })
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Skeleton loader for initial loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="animate-pulse">
          <h1 className="text-4xl font-bold text-emerald-800">Jaba Voting Platform</h1>
          <p className="text-center text-emerald-600 mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-4xl font-bold mb-8 text-center text-emerald-800 
          animate-gradient-x bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 
          bg-clip-text text-transparent">
          Jaba Voting Platform 🌿
        </h1>
        
        {user ? (
          <UserProfile 
            user={user} 
            onCreateCategory={handleCreateCategory} 
            onLogout={handleLogout} 
          />
        ) : (
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Login/Registration Card */}
            <div className="w-full">
              <Card className="shadow-2xl border-0 rounded-xl overflow-hidden">
                <CardHeader className="text-center bg-emerald-50 rounded-t-xl pb-4">
                  <CardTitle className="text-2xl font-bold text-emerald-800">Welcome</CardTitle>
                  <CardDescription>Join our decentralized voting platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="flex items-center mb-2">
                        <User className="mr-2 h-5 w-5 text-emerald-600" />
                        Full Name
                      </Label>
                      <Input 
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={registrationData.name}
                        onChange={handleRegistrationChange}
                        className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="flex items-center mb-2">
                        <Mail className="mr-2 h-5 w-5 text-emerald-600" />
                        Email Address
                      </Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registrationData.email}
                        onChange={handleRegistrationChange}
                        className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 transition-colors 
                        text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg"
                    >
                      <Lock className="mr-2 h-5 w-5" />
                      Login / Register
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="text-center text-xs text-gray-500 bg-emerald-50 rounded-b-xl p-4">
                  By logging in, you agree to our terms of service
                </CardFooter>
              </Card>
            </div>

            {/* Information Section */}
            <div className="space-y-6">
              <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-800">
                    <VoteIcon className="mr-2 h-6 w-6 text-emerald-600" />
                    Recent Proposals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentProposals />
                </CardContent>
              </Card>

              <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center text-emerald-800">
                    <Globe className="mr-2 h-6 w-6 text-emerald-600" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-emerald-500" />
                      <span>Create Proposals on Important Issues</span>
                    </li>
                    <li className="flex items-center">
                      <VoteIcon className="mr-2 h-5 w-5 text-emerald-500" />
                      <span>Participate in Transparent Voting</span>
                    </li>
                    <li className="flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-emerald-500" />
                      <span>Decentralized Community Decision Making</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

