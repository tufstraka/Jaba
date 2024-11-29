'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
//import { ThemeToggle } from '@/components/theme-toggle'
import { createActor, login, logout, getPrincipal } from '@/utils/actor'
import { useToast } from '@/hooks/use-toast'

interface User {
  principal: { toText: () => string }
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [actor, setActor] = useState(null)
  const pathname = usePathname()
  const { toast } = useToast()

  /*useEffect(() => {
    const initActor = async () => {
      const newActor = await createActor()
      setActor(newActor)
    }
    initActor()
  }, [])





  const handleLogin = async () => {
    const success = await login()
    if (success) {
      const newActor = await createActor()
      setActor(newActor)
      toast({
        title: "Logged in",
        description: "You have successfully logged in.",
      })
    } else {
      toast({
        title: "Login failed",
        description: "Failed to log in. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
    setActor(null)
    toast({
      title: "Logged out",
      description: "You have been logged out.",
    })
  }*/

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold">Jaba 🌿</Link>
          <div className="flex items-center space-x-4">
            <Link href="/" className={pathname === '/' ? 'font-bold' : ''}>Home</Link>
            <Link href="/proposals" className={pathname.startsWith('/proposals') ? 'font-bold' : ''}>Proposals</Link>
            <Link href="/categories" className={pathname.startsWith('/categories') ? 'font-bold' : ''}>Categories</Link>
            {user && (
              <Link href="/profile" className={pathname === '/profile' ? 'font-bold' : ''}>Profile</Link>
            )}
            {/*<ThemeToggle />
            {user ? (
              <Button onClick={handleLogout}>Logout</Button>
            ) : (
              <Button onClick={handleLogin}>Login</Button>
            )}*/}
          </div>
        </div>
      </div>
    </nav>
  )
}

