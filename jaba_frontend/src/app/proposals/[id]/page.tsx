'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createActor } from '@/utils/actor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from "@/hooks/use-toast"
import { getPrincipal } from '@/utils/actor'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Clock, 
  User as UserIcon, 
  CheckCircle2, 
  XCircle 
} from 'lucide-react'

interface Proposal {
  id: string
  title: string
  description: string
  creator: string
  yesVotes: string
  noVotes: string
  status: string
  category: string
  createdAt: string
}

interface Comment {
  id: string
  proposalId: string
  content: string
  author: string
  createdAt: string
}

interface User {
  principal: { toText: () => string }
}

export default function ProposalPage() {
  const [proposal, setProposal] = useState<Proposal | null>(null) 
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [actor, setActor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const { id } = useParams()
  const { toast } = useToast()

  useEffect(() => {
    const initActor = async () => {
      try {
        const newActor = await createActor()
        setActor(newActor)
        
        // Get user principal and details
        const principalResult = await getPrincipal()
        if (principalResult) {
 
          setUser(principalResult as User)
          
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error initializing:', error)
        toast({
          title: "Initialization Error",
          description: "Failed to initialize. Please refresh.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }
    initActor()
  }, [])

  useEffect(() => {
    const fetchProposalData = async () => {
      if (!actor) return

      try {
        // Fetch proposal
        const proposalResult = await actor.getProposal(id)

        console.log('proposalResult:', proposalResult)
        if (proposalResult) {
          setProposal(proposalResult)
        }

        // Fetch comments
        const commentsResult = await actor.getComments(id)
        if ('Ok' in commentsResult) {
          // Sort comments by creation time
            const sortedComments: Comment[] = commentsResult.Ok.sort((a: Comment, b: Comment) => 
            Number(b.createdAt) - Number(a.createdAt)
            )
          setComments(sortedComments)
        }
      } catch (error) {
        console.error('Error fetching proposal data:', error)
        toast({
          title: "Fetch Error",
          description: "Failed to load proposal details.",
          variant: "destructive",
        })
      }
    }

    if (actor) {
      fetchProposalData()
    }
  }, [actor, id])

  const handleVote = async (proposalId: string, voteType: string) => {
    if (!actor || !user) {
      toast({
        title: "Error",
        description: "Please log in to vote.",
        variant: "destructive",
      })
      return
    }

    try {
      const voteResult = await actor.vote(proposalId, voteType, user.principal.toText())
      
      if ('Ok' in voteResult) {
        // Update proposal in state
        setProposal(voteResult.Ok)
        toast({
          title: "Vote Recorded",
          description: `Successfully voted ${voteType}`,
        })
      } else {
        // Handle error case
        toast({
          title: "Vote Error",
          description: voteResult.Err.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Voting error:', error)
      toast({
        title: "Vote Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!actor || !user) {
      toast({
        title: "Error",
        description: "Please log in to comment.",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Invalid Comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      const commentResult = await actor.createComment(id, newComment, user.principal)
      
      if ('Ok' in commentResult) {
        // Add new comment to state
        const newCommentObj = commentResult.Ok
        setComments([newCommentObj, ...comments])
        
        // Clear input
        setNewComment('')
        
        toast({
          title: "Comment Added",
          description: "Your comment has been successfully posted.",
        })
      } else {
        // Handle error case
        toast({
          title: "Comment Error",
          description: commentResult.Err.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Comment error:', error)
      toast({
        title: "Comment Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        {proposal ? (
          <>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{proposal.title}</CardTitle>
                  <CardDescription className="mt-2">
                    Created by: {proposal.creator} on {new Date(Number(proposal.createdAt)).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    proposal.status === 'Open' ? 'default' : 
                    proposal.status === 'Closed' ? 'destructive' : 'outline'
                  }
                >
                  {proposal.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <p className="text-gray-700">{proposal.description}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                    <span>Votes For: {proposal.yesVotes}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ThumbsDown className="w-5 h-5 text-red-600" />
                    <span>Votes Against: {proposal.noVotes}</span>
                  </div>
                </div>
                <Progress 
                  value={Number(proposal.yesVotes) / (Number(proposal.yesVotes) + Number(proposal.noVotes)) * 100} 
                  className="w-full h-2 bg-gray-200"
                />
              </div>

              {proposal.status === 'Open' && (
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => handleVote(proposal.id, 'yes')} 
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Vote For
                  </Button>
                  <Button 
                    onClick={() => handleVote(proposal.id, 'no', )} 
                    variant="destructive"
                  >
                    Vote Against
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Comments ({comments.length})
                </h3>
                
                {comments.length === 0 ? (
                  <p className="text-center text-gray-500">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="bg-white border rounded-lg p-4 shadow-sm"
                    >
                      <p>{comment.content}</p>
                      <div className="text-sm text-gray-500 mt-2 flex justify-between">
                        <span>By: {comment.author}</span>
                        <span>
                          {new Date(Number(comment.createdAt)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                <div className="mt-4">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="mb-2"
                  />
                  <Button 
                    onClick={handleAddComment}
                    className="w-full"
                  >
                    Post Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <div className="text-center p-8">Proposal not found</div>
        )}
      </Card>
    </div>
  )
}