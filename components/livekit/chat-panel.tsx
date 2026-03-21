"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Heart, Zap } from "lucide-react"

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
  role?: "host" | "moderator" | "viewer"
  isPinned?: boolean
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
  const [likes, setLikes] = useState<Record<string, number>>({})
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

  const handleLikeMessage = (msgId: string) => {
    setLikes((prev) => ({
      ...prev,
      [msgId]: (prev[msgId] || 0) + 1,
    }))
  }

  const roleColors: Record<string, { bg: string; text: string; badge: string }> = {
    host: { bg: "bg-red-50 dark:bg-red-950", text: "text-red-900 dark:text-red-200", badge: "bg-red-500" },
    moderator: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-900 dark:text-blue-200", badge: "bg-blue-500" },
    viewer: { bg: "bg-transparent", text: "text-foreground", badge: "" },
  }

  const currentRole = userRole || "viewer"
  const roleStyle = roleColors[currentRole]

  return (
    <Card className="h-full flex flex-col border-0 shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          Live Chat
        </CardTitle>
      </CardHeader>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-2">
              <MessageSquare className="w-8 h-8 text-muted-foreground opacity-40 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">No messages yet</p>
              <p className="text-xs text-muted-foreground">Be the first to say hello!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg transition-all hover:shadow-md ${roleStyle.bg} border border-transparent hover:border-primary/20 group`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`font-bold text-sm ${roleStyle.text}`}>{msg.user}</span>
                  {msg.role && msg.role !== "viewer" && (
                    <Badge className={`${roleStyle.badge} text-white text-xs px-2 py-0.5`}>
                      {msg.role.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-foreground break-words mb-2">{msg.message}</p>
              {likes[msg.id] > 0 && (
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  <span className="text-xs text-red-500 font-semibold">{likes[msg.id]}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <CardContent className="border-t p-4 bg-white dark:bg-card">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something..."
            disabled={loading}
            className="text-sm h-10"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
