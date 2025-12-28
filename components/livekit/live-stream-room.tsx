"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { useLiveKit } from "@/hooks/use-livekit"
import LiveStudio from "./live-studio"
import ChatPanel from "./chat-panel"
import ViewerList from "./viewer-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface LiveStreamRoomProps {
  streamId: string
  roomName: string
  onError?: (error: string) => void
}

export default function LiveStreamRoom({ streamId, roomName, onError }: LiveStreamRoomProps) {
  const { user, loading } = useAuth()
  const { getAccessToken } = useLiveKit()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadingToken, setLoadingToken] = useState(true)

  useEffect(() => {
    const initializeStream = async () => {
      if (!user || loading) return

      try {
        setLoadingToken(true)
        const accessToken = await getAccessToken(roomName, user.display_name || user.email)
        setToken(accessToken)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to initialize stream"
        setError(errorMessage)
        onError?.(errorMessage)
      } finally {
        setLoadingToken(false)
      }
    }

    initializeStream()
  }, [user, loading, roomName, getAccessToken, onError])

  if (loading || loadingToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black p-4">
        <Alert className="max-w-md border-red-500 bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <p className="text-white">No access token available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col lg:flex-row gap-4 bg-black p-4">
      {/* Video Studio */}
      <div className="flex-1 min-h-0">
        <LiveStudio
          roomName={roomName}
          userName={user?.display_name || user?.email || "Guest"}
          token={token}
          onDisconnect={() => {
            // Handle disconnect
          }}
        />
      </div>

      {/* Sidebar with Chat and Viewers */}
      <div className="w-full lg:w-80 flex flex-col gap-4 min-h-0">
        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <ChatPanel roomName={roomName} userName={user?.display_name || "Guest"} userRole={user?.role as any} />
        </div>

        {/* Viewer List */}
        <div className="flex-1 min-h-0">
          <ViewerList roomName={roomName} maxDisplay={15} />
        </div>
      </div>
    </div>
  )
}
