import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Analytics({ actor }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const result = await actor.getAnalytics()
      if ('Ok' in result) {
        setAnalytics(result.Ok)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[180px] mb-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total Proposals: {analytics.totalProposals.toString()}</p>
        <p>Total Votes: {analytics.totalVotes.toString()}</p>
        <p>Total Comments: {analytics.totalComments.toString()}</p>
        <h3 className="font-semibold mt-4 mb-2">Proposals by Category:</h3>
        <ul>
          {analytics.categoryCounts.map((categoryCount, index) => (
            <li key={index}>
              {categoryCount.category}: {categoryCount.count.toString()}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

