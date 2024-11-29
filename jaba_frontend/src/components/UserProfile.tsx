import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { 
  LogOut, 
  PlusCircle, 
  User as UserIcon, 
  Clipboard, 
  ClipboardCopy 
} from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

interface User {
  principal: { toText: () => string }
}

interface UserProfileProps {
  user: User
  onCreateCategory: (name: string) => void
  onLogout: () => Promise<void>
}

export default function UserProfile({ user, onCreateCategory, onLogout }: UserProfileProps) {
  const [newCategory, setNewCategory] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate category name
    const trimmedCategory = newCategory.trim()
    if (!trimmedCategory) {
      toast({
        title: "Validation Error",
        description: "Category name cannot be empty.",
        variant: "destructive"
      })
      return
    }

    if (trimmedCategory.length < 2) {
      toast({
        title: "Validation Error",
        description: "Category name must be at least 2 characters long.",
        variant: "destructive"
      })
      return
    }

    onCreateCategory(trimmedCategory)
    setNewCategory('')
    toast({
      title: "Category Created",
      description: `Category "${trimmedCategory}" has been created.`
    })
  }

  const handleCopyPrincipal = () => {
    const principalText = user.principal.toText()
    navigator.clipboard.writeText(principalText).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast({
        title: "Copied",
        description: "Principal ID copied to clipboard"
      })
    })
  }

  return (
    <Card className="max-w-md mx-auto shadow-2xl border-0 rounded-xl overflow-hidden 
      bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-emerald-50 border-b border-emerald-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold text-emerald-800 flex items-center">
            <UserIcon className="mr-2 h-6 w-6 text-emerald-600" />
            User Profile
          </CardTitle>
        </div>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onLogout} 
          className="bg-red-50 text-red-600 hover:bg-red-100"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-emerald-50 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <Clipboard className="mr-2 h-5 w-5 text-emerald-600" />
            <span className="font-mono text-sm text-emerald-800 truncate max-w-[200px]">
              {user.principal.toText()}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCopyPrincipal}
            className="hover:bg-emerald-100 text-emerald-600"
          >
            {isCopied ? (
              <ClipboardCopy className="h-4 w-4 text-emerald-500" />
            ) : (
              <ClipboardCopy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label 
              htmlFor="newCategory" 
              className="flex items-center text-emerald-800"
            >
              <PlusCircle className="mr-2 h-5 w-5 text-emerald-600" />
              Create New Category
            </Label>
            <Input
              id="newCategory"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                transition-all duration-300"
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-700 
              transition-colors text-white font-semibold py-3 rounded-lg 
              shadow-md hover:shadow-lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create Category
          </Button>
        </form>
      </CardContent>
      <CardFooter className="bg-emerald-50 border-t border-emerald-100 text-xs text-gray-500 p-4 text-center">
        Manage your profile and create new voting categories
      </CardFooter>
    </Card>
  )
}


