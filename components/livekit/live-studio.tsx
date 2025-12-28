"use client"
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import { useAuth } from "@/context/auth-context"
import "@livekit/components-styles"

interface LiveStudioProps {
  roomName: string
  userName: string
  token: string
  onDisconnect?: () => void
}

export default function LiveStudio({ roomName, userName, token, onDisconnect }: LiveStudioProps) {
  const { user } = useAuth()

  return (
    <div className="w-full h-screen bg-black">
      <LiveKitRoom
        video={user?.role === "host"}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        onDisconnected={onDisconnect}
        data-lk-theme="dark"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  )
}
