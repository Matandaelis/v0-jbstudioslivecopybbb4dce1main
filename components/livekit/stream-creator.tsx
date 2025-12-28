"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLiveKit } from "@/hooks/use-livekit"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "lucide-react"

export default function StreamCreator() {
  const router = useRouter()
  const { user } = useAuth()
  const { createStream } = useLiveKit()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduled_at: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const response = await createStream({
        host_id: user.id,
        title: formData.title,
        description: formData.description,
        room_name: `stream_${user.id}_${Date.now()}`,
        status: "scheduled",
        scheduled_at: formData.scheduled_at || new Date().toISOString(),
        is_public: true,
        viewer_count: 0,
      })

      router.push(`/host-dashboard?stream=${response.id}`)
    } catch (error) {
      console.error("Error creating stream:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Stream</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter stream title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter stream description"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="scheduled_at" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule For (Optional)
            </Label>
            <Input
              id="scheduled_at"
              name="scheduled_at"
              type="datetime-local"
              value={formData.scheduled_at}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Stream"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
