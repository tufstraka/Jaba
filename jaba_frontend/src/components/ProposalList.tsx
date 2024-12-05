'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createActor } from '@/utils/actor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import toast from 'react-hot-toast'
import { MessageCircle, ThumbsUp, ThumbsDown, X } from 'lucide-react'

interface Proposal {
  id: string
  title: string
  description: string
  creator: string
  yesVotes: string
  noVotes: string
  status: string
  category: string
}

interface Comment {
  id: string
  content: string
  author: string
}

interface Actor {
  getProposals: () => Promise<Proposal[]>;
  vote: (proposalId: string, inFavor: boolean) => Promise<{ Ok?: string }>;
  getComments: (proposalId: string) => Promise<{ Ok?: Comment[] }>;
  createComment: (proposalId: string, content: string, author: string ) => Promise<Comment>;
  endProposal: (proposalId: string) => Promise<{ Ok?: boolean }>;
} 

export default function ProposalList({ proposals, handleVote, fetchProposals, user }: { 
  proposals: Proposal[], 
  handleVote: (proposalId: string, inFavor: string, user: string) => void, 
  fetchProposals: () => void, 
  user: { principal: { toText: () => string } } 
}) {
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [actor, setActor] = useState<Actor | null>(null)
  const [expandedProposals, setExpandedProposals] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const initActor = async () => {
      const newActor = await createActor()
      setActor(newActor)
    }
    initActor()
  }, [])

  useEffect(() => {
    const fetchCommentsForAllProposals = async () => {
      for (const proposal of proposals) {
        fetchComments(proposal.id);
      }
    }
    if (proposals.length > 0) {
      fetchCommentsForAllProposals();
    }
  }, [proposals])

  const fetchComments = async (proposalId: string) => {
    try {
      if (!actor) {
        toast("Actor is not initialized", { icon: '❌' })
        return;
      }
      const result = await actor.getComments(proposalId)


      if ('Ok' in result) {
        if (result.Ok) {
          setComments(prev => ({ ...prev, [proposalId.toString()]: result.Ok || [] }))
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      toast("Failed to fetch comments", { icon: '❌' })
    }
  }

  const handleCreateComment = async (proposalId: string) => {
    try {
      if (!actor) {
        toast("Actor is not initialized", { icon: '❌' })
        return;
      }
      
      const commentContent = newComments[proposalId]?.trim()
      if (!commentContent) {
        toast("Comment cannot be empty", { icon: '❌' })
        return;
      }

      const result = await actor.createComment(proposalId, commentContent, user.principal.toText())
      if ('Ok' in result) {
        fetchComments(proposalId)
        setNewComments(prev => ({ ...prev, [proposalId.toString()]: '' }))
        toast("Comment added successfully", { icon: '🎉' })
      }
    } catch (error) {
      console.error('Error creating comment:', error)
      toast("Failed to create comment", { icon: '❌' })
    }
  }

  const handleEndProposal = async (proposalId: string) => {
    try {
      if (!actor) {
        toast("Actor is not initialized", { icon: '❌' })
        return;
      }
      console.log(typeof proposalId)
      const result = await actor.endProposal(proposalId)

      console.log('end proposal result', result)
      if ('Ok' in result) {
        fetchProposals()
        toast("Proposal ended successfully", { icon: '🎉' })
      }
    } catch (error) {
      console.error('Error ending proposal:', error)
      toast("Failed to end proposal", { icon: '❌' })
    }
  }

  const toggleProposalExpand = (proposalId: string) => {
    setExpandedProposals(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }))
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-green-100 text-green-800'
      case 'Closed': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {proposals.map((proposal) => (
        <Card 
          key={proposal.id} 
          className="mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-0"
        >
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start space-y-2 sm:space-y-0">
              <div className="flex-grow pr-4">
                <CardTitle className="text-lg sm:text-xl font-bold break-words">
                  {proposal.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
                  Created by: {proposal.creator}
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(proposal.status)} px-2 py-1 text-xs`}>
                {proposal.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-gray-700 mb-4 text-sm sm:text-base ${expandedProposals[proposal.id] ? '' : 'line-clamp-3'}`}>
              {proposal.description}
            </p>
            {!expandedProposals[proposal.id] && proposal.description.length > 150 && (
              <button 
                onClick={() => toggleProposalExpand(proposal.id)}
                className="text-blue-600 hover:underline text-xs sm:text-sm"
              >
                Read more
              </button>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center space-x-1 text-green-600">
                  <ThumbsUp size={16} />
                  <span className="text-sm">{proposal.yesVotes}</span>
                </div>
                <div className="flex items-center space-x-1 text-red-600">
                  <ThumbsDown size={16} />
                  <span className="text-sm">{proposal.noVotes}</span>
                </div>
              </div>
              <Progress 
                value={Number(proposal.yesVotes) / (Number(proposal.yesVotes) + Number(proposal.noVotes)) * 100} 
                className="w-full sm:w-1/2 mt-2 sm:mt-0"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <Button 
                variant="outline" 
                onClick={() => handleVote(proposal.id, "yes", user.principal.toText())}
                className="w-full flex items-center space-x-2"
              >
                <ThumbsUp size={16} />
                <span>Vote For</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleVote(proposal.id, "no", user.principal.toText())}
                className="w-full flex items-center space-x-2"
              >
                <ThumbsDown size={16} />
                <span>Vote Against</span>
              </Button>
              {proposal.status === 'Open' && (
                <Button 
                  variant="destructive" 
                  onClick={() => handleEndProposal(proposal.id)}
                  className="w-full flex items-center space-x-2"
                >
                  <X size={16} />
                  <span>End Proposal</span>
                </Button>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <MessageCircle size={20} className="mr-2 text-gray-600" />
                <h4 className="text-base sm:text-lg font-semibold text-gray-700">Comments</h4>
              </div>
              {comments[proposal.id]?.map((comment) => (
                <div 
                  key={comment.id} 
                  className="bg-white p-3 rounded-md mb-2 shadow-sm border"
                >
                  <p className="font-medium text-gray-800 text-xs sm:text-sm">
                    {comment.author}
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {comment.content}
                  </p>
                </div>
              ))}
              <div className="mt-4">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComments[proposal.id] || ''}
                  onChange={(e) => setNewComments(prev => ({ 
                    ...prev, 
                    [proposal.id]: e.target.value 
                  }))}
                  className="mb-2"
                />
                <Button 
                  onClick={() => handleCreateComment(proposal.id)}
                  className="w-full"
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Link href={`/proposals/${proposal.id}`}>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-800">
                View Full Details
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
      {proposals.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No proposals available. Create your first proposal!
        </div>
      )}
    </div>
  )
}