"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send } from "lucide-react"

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
  role?: "host" | "moderator" | "viewer"
}

interface ChatPanelProps {
  roomName: string
  userName: string
  userRole?: "host" | "moderator" | "viewer"
}

export default function ChatPanel({ roomName, userName, userRole = "viewer" }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        user: userName,
        message: input,
        timestamp: new Date(),
        role: userRole,
      }

      setMessages((prev) => [...prev, newMessage])
      setInput("")

      // Send to server for persistence
      await fetch(`/api/streams/${roomName}/chat`, {
        method: "POST",
        body: JSON.stringify(newMessage),
      })
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Live Chat
        </CardTitle>
      </CardHeader>

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{msg.user}</span>
                {msg.role === "host" && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">HOST</span>}
                {msg.role === "moderator" && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">MOD</span>
                )}
                <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-gray-700">{msg.message}</p>
            </div>
          ))}
        </div>
      </div>

      <CardContent className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
