import { Suspense } from "react"
import ProtectedRoute from "@/components/protected-route"
import LiveStreamRoom from "@/components/livekit/live-stream-room"

interface LivePageProps {
  params: {
    streamId: string
  }
}

export default function LivePage({ params }: LivePageProps) {
  const roomName = `stream_${params.streamId}`

  return (
    <ProtectedRoute requiredRole={["admin", "host", "brand_partner", "vendor", "affiliate", "viewer", "moderator"]}>
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        }
      >
        <LiveStreamRoom streamId={params.streamId} roomName={roomName} />
      </Suspense>
    </ProtectedRoute>
  )
}
