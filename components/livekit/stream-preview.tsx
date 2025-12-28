"use client"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Share2 } from "lucide-react"
import type { LiveStream } from "@/lib/types"

interface StreamPreviewProps {
  stream: LiveStream
  onJoin?: () => void
  showActions?: boolean
}

export default function StreamPreview({ stream, onJoin, showActions = true }: StreamPreviewProps) {
  const isLive = stream.status === "live"
  const viewerCount = stream.viewer_count || 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-video bg-gray-900">
        {stream.thumbnail_url && (
          <Image src={stream.thumbnail_url || "/placeholder.svg"} alt={stream.title} fill className="object-cover" />
        )}
        {isLive && (
          <Badge className="absolute top-3 right-3 bg-red-500">
            <span className="animate-pulse">●</span> LIVE
          </Badge>
        )}
      </div>

      <CardHeader>
        <div className="space-y-2">
          <CardTitle className="text-lg line-clamp-2">{stream.title}</CardTitle>
          <p className="text-sm text-gray-600 line-clamp-2">{stream.description}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{viewerCount} viewers</span>
          </div>
          {isLive && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>LIVE NOW</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button onClick={onJoin} className="flex-1" disabled={!isLive}>
              Join Stream
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
