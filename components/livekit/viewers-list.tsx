"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Globe } from "lucide-react"

interface Viewer {
  id: string
  name: string
  avatar?: string
  role?: "host" | "moderator" | "viewer"
  isFollowing?: boolean
}

interface ViewersListProps {
  viewers?: Viewer[]
  totalViewers?: number
  maxDisplay?: number
}

const MOCK_VIEWERS: Viewer[] = [
  { id: "1", name: "Sarah K.", role: "viewer", isFollowing: true },
  { id: "2", name: "Mike O.", role: "viewer", isFollowing: false },
  { id: "3", name: "Grace W.", role: "moderator", isFollowing: true },
  { id: "4", name: "James M.", role: "viewer", isFollowing: false },
  { id: "5", name: "Faith N.", role: "viewer", isFollowing: true },
]

export default function ViewersList({
  viewers = MOCK_VIEWERS,
  totalViewers = 3421,
  maxDisplay = 5,
}: ViewersListProps) {
  const displayedViewers = viewers.slice(0, maxDisplay)
  const remainingViewers = Math.max(0, viewers.length - maxDisplay)

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "host":
        return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
      case "moderator":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
      default:
        return "bg-muted text-muted-foreground border-transparent"
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            Watching Now
          </h3>
          <Badge className="bg-primary text-white text-xs px-2 py-1 font-bold">
            <Globe className="w-3 h-3 mr-1" />
            {totalViewers.toLocaleString()}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {displayedViewers.map((viewer) => (
          <div
            key={viewer.id}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted cursor-pointer`}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {viewer.name.charAt(0)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground truncate">{viewer.name}</span>
                {viewer.role && viewer.role !== "viewer" && (
                  <Badge
                    variant="outline"
                    className={`text-xs px-1.5 py-0.5 ${getRoleColor(viewer.role)}`}
                  >
                    {viewer.role === "host" ? "🎤" : "⭐"}
                  </Badge>
                )}
              </div>
              {viewer.isFollowing && (
                <span className="text-xs text-primary font-semibold">Following</span>
              )}
            </div>

            {/* Status Indicator */}
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
          </div>
        ))}

        {remainingViewers > 0 && (
          <div className="p-3 text-center">
            <span className="text-xs font-semibold text-primary">
              +{remainingViewers} more viewer{remainingViewers !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
