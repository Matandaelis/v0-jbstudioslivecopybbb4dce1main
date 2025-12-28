"use client"

import { useCallback } from "react"
import type { LiveStream } from "@/lib/types"

export function useLiveKit() {
  const getAccessToken = useCallback(async (roomName: string, userName: string) => {
    try {
      const response = await fetch("/api/livekit/token", {
        method: "POST",
        body: JSON.stringify({
          roomName,
          userName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get access token")
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error("Error getting LiveKit token:", error)
      throw error
    }
  }, [])

  const createStream = useCallback(async (streamData: Omit<LiveStream, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        body: JSON.stringify(streamData),
      })

      if (!response.ok) {
        throw new Error("Failed to create stream")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating stream:", error)
      throw error
    }
  }, [])

  const joinStream = useCallback(async (streamId: string, role: "host" | "guest" | "viewer") => {
    try {
      const response = await fetch(`/api/streams/${streamId}/join`, {
        method: "POST",
        body: JSON.stringify({ role }),
      })

      if (!response.ok) {
        throw new Error("Failed to join stream")
      }

      return await response.json()
    } catch (error) {
      console.error("Error joining stream:", error)
      throw error
    }
  }, [])

  return {
    getAccessToken,
    createStream,
    joinStream,
  }
}
