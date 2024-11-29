'use client'
import ProposalList from '@/components/ProposalList'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createActor } from '@/utils/actor'
import { useToast } from '@/hooks/use-toast'
import { getPrincipal } from '@/utils/actor'

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

interface User {
  principal: { toText: () => string }
}

interface Actor {
  getProposals: () => Promise<Proposal[]>;
  vote: (proposalId: string, inFavor: string, voter: string) => Promise<Proposal>;
  getComments: (proposalId: string) => Promise<{ Ok?: Comment[] }>;
  createComment: (proposalId: string, content: string) => Promise<{ Ok?: Comment }>;
  endProposal: (proposalId: string) => Promise<{ Ok?: boolean }>;
}  



export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [actor, setActor] = useState<Actor | null>(null);
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();



  useEffect(() => {
    const initActor = async () => {
      const newActor = await createActor()

      setActor(newActor)
    }
    initActor()
  }, [])

  useEffect(() => {
    if (actor) {
      fetchUser()
      fetchProposals()
    }
  }, [actor])

  const fetchUser = async () => {
    try {
      const result = await getPrincipal()
      if (result) {
        setUser(result as User)
      }

      console.log('User:', result)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast({
        title: "Error",
        description: "Failed to fetch user data. Please try again.",
        variant: "destructive",
      })
    }
  }



  const fetchProposals = async () => {
    setLoading(true)
    try {
      if (!actor) {
        toast({
          title: "Error",
          description: "Actor is not initialized. Please try again.",
          variant: "destructive",
        });
        console.error('Actor is not initialized. Please try again.');
        setLoading(false);
        return;
      }
      const result = await actor.getProposals()

      console.log('proposals:', result)
      if (result && Array.isArray(result)) {
          setProposals(result)
      } else {
          setProposals([])
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
      toast({
        title: "Error",
        description: "Failed to fetch proposals. Please try again.",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleVote = async (proposalId: string, inFavor: string, voter: string) => {
    try {
      if (!actor) {
        toast({
          title: "Error",
          description: "Actor is not initialized. Please try again.",
          variant: "destructive",
        });

        console.error('Actor is not initialized. Please try again.');
        return;
      }
      const result = await actor.vote(proposalId, inFavor, voter)
      if (result) {
        fetchProposals()
        toast({
          title: "Vote recorded",
          description: "Your vote has been recorded successfully.",
        })
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast({
        title: "Error",
        description: "Failed to record vote. Please try again.",
        variant: "destructive",
      })
    }
  }




  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Proposals</h1>
        <Link href="/proposals/create">
          <Button>Create Proposal</Button>
        </Link>
      </div>
      <Suspense fallback={<div>Loading proposals...</div>}>
        {user && (
          <ProposalList proposals={proposals} handleVote={handleVote} fetchProposals={fetchProposals} user={user} />
        )}
      </Suspense>
    </div>
  )
}

