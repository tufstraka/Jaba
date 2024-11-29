'use client'

import { useState, useEffect, useCallback } from 'react'
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

interface Actor {
  getProposal: (id: string) => Promise<{ Ok?: Proposal, Err?: any }>;
  vote: (proposalId: string, voteType: string, voter: string) => Promise<{ Ok?: Proposal, Err?: any }>;
  getComments: (proposalId: string) => Promise<{ Ok?: Comment[], Err?: any }>;
  createComment: (proposalId: string, content: string, author: string) => Promise<{ Ok?: Comment, Err?: any }>;
  endProposal: (proposalId: string) => Promise<{ Ok?: string, Err?: any }>;
}


export default function ProposalPage() {
  const [proposal, setProposal] = useState<Proposal | null>(null) 
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [actor, setActor] = useState<Actor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const { id } = useParams()
  const { toast } = useToast()

  const initializeData = useCallback(async () => {
    try {
      const newActor = await createActor()
      setActor(newActor)
      
      const principalResult = await getPrincipal()
      if (principalResult) {
        setUser(principalResult as User)
      }
      
      if (typeof id === 'string') {
        await fetchProposalDetails(newActor, id)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Initialization error:', error)
      setError('Failed to initialize the page. Please try again.')
      setLoading(false)
      toast({
        title: "Initialization Error",
        description: "Failed to load proposal details.",
        variant: "destructive",
      })
    }
  }, [id, toast])
  const fetchProposalDetails = async (currentActor: Actor, proposalId: string) => {
    try {
      const proposalResult = await currentActor.getProposal(proposalId)
      if (proposalResult.Ok) {
        setProposal(proposalResult.Ok)
      } else {
        throw new Error(proposalResult.Err?.message || 'Failed to fetch proposal')
      }

      const commentsResult = await currentActor.getComments(proposalId)
      if (commentsResult.Ok) {
        const sortedComments = commentsResult.Ok.sort((a, b) => 
          Number(b.createdAt) - Number(a.createdAt)
        )
        setComments(sortedComments)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setError('Failed to load proposal details')
      toast({
        title: "Fetch Error",
        description: "Could not retrieve proposal information.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    initializeData()
  }, [initializeData])

  const handleVote = async (proposalId: string, voteType: string) => {
    if (!actor || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to vote.",
        variant: "destructive",
      })
      return
    }

    try {
      const voteResult = await actor.vote(proposalId, voteType, user.principal.toText())
      
      if (voteResult.Ok) {
        setProposal(voteResult.Ok)
        toast({
          title: "Vote Recorded",
          description: `Successfully voted ${voteType}`,
        })
      } else {
        throw new Error(voteResult.Err?.message || 'Vote failed')
      }
    } catch (error: any) {
      console.error('Voting error:', error)
      toast({
        title: "Vote Error",
        description: error.message || "Failed to record vote.",
        variant: "destructive",
      })
    }
  }

  const handleAddComment = async () => {
    if (!actor || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to comment.",
        variant: "destructive",
      })
      return
    }

    const trimmedComment = newComment.trim()
    if (!trimmedComment) {
      toast({
        title: "Invalid Comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }

    try {
      if (typeof id === 'string') {
        const commentResult = await actor.createComment(
          id, 
          trimmedComment, 
          user.principal.toText()
        )
        
        if (commentResult.Ok) {
          const newCommentObj = commentResult.Ok
          if (newCommentObj) {
            setComments([newCommentObj, ...comments])
            setNewComment('')
          }
          
          toast({
            title: "Comment Added",
            description: "Your comment was successfully posted.",
          })
        } else {
          throw new Error(commentResult.Err?.message || 'Comment creation failed')
        }
      }
    } catch (error: any) {
      console.error('Comment error:', error)
      toast({
        title: "Comment Error",
        description: error.message || "Failed to add comment.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="text-gray-600">Loading proposal details...</p>
        </div>
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Card className="w-96 text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error || 'Proposal not found'}</p>
            <Button onClick={() => initializeData()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
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