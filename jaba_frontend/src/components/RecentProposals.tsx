'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createActor } from '@/utils/actor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'


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

export default function RecentProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    const fetchProposals = async () => {
      const actor = await createActor()
      try {
        const result = await actor.getProposals()
        console.log('proposals:', result)
        if (result) {
          setProposals(result.slice(0, 3)) 
        }
      } catch (error) {
        console.error('Error fetching proposals:', error)
      }
    }
    fetchProposals()
  }, [])

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <Card key={proposal.id}>
          <CardHeader>
            <CardTitle>{proposal.title}</CardTitle>
            <CardDescription>Created by: {proposal.creator}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">{proposal.description.slice(0, 100)}...</p>
            <Link href={`/proposals/${proposal.id}`} className="text-primary hover:underline">
              View Proposal
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

