'use client'
import ProposalList from '@/components/ProposalList'
import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createActor } from '@/utils/actor'
import { getPrincipal } from '@/utils/actor'
import toast from 'react-hot-toast'

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
      toast("Failed to fetch user", { icon: '❌' })
    }
  }



  const fetchProposals = async () => {
    setLoading(true)
    try {
      if (!actor) {
        toast("Actor is not initialized. Please try again.", { icon: '❌' });
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
      toast("Failed to fetch proposals", { icon: '❌' })
    }
    setLoading(false)
  }

  const handleVote = async (proposalId: string, inFavor: string, voter: string) => {
    try {
      if (!actor) {
        toast("Actor is not initialized. Please try again.", { icon: '❌' });
        console.error('Actor is not initialized. Please try again.');
        return;
      }
      const result = await actor.vote(proposalId, inFavor, voter)

      console.log('vote result:', result  )
      if (result) {
        fetchProposals()
        toast("Vote recorded successfully.", { icon: '🎉' })
        console.log('Vote recorded successfully.')
      }
    } catch (error) {
      console.error('Error voting:', error)
      toast("Failed to record vote", { icon: '❌' })
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

