"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { StreamParticipant, User } from "@/lib/types"

interface ViewerListProps {
  roomName: string
  maxDisplay?: number
}

export default function ViewerList({ roomName, maxDisplay = 10 }: ViewerListProps) {
  const [viewers, setViewers] = useState<Array<StreamParticipant & { user?: User }>>([])
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchViewers = async () => {
      try {
        const response = await fetch(`/api/streams/${roomName}/viewers`)
        if (response.ok) {
          const data = await response.json()
          setViewers(data.participants || [])
          setTotalCount(data.total || 0)
        }
      } catch (error) {
        console.error("Error fetching viewers:", error)
      }
    }

    fetchViewers()
    const interval = setInterval(fetchViewers, 5000)
    return () => clearInterval(interval)
  }, [roomName])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Viewers ({totalCount})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {viewers.slice(0, maxDisplay).map((viewer) => (
            <div key={viewer.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={viewer.user?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>{viewer.user?.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{viewer.user?.display_name}</p>
                  <p className="text-xs text-gray-500">{viewer.role}</p>
                </div>
              </div>
              {viewer.role !== "viewer" && <Badge variant="secondary">{viewer.role}</Badge>}
            </div>
          ))}

          {totalCount > maxDisplay && (
            <p className="text-sm text-gray-600 text-center py-2">+{totalCount - maxDisplay} more viewers</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
