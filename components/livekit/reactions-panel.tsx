"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface Reaction {
  id: string
  emoji: string
  position: { x: number; y: number }
}

interface ReactionsPanelProps {
  onReaction?: (emoji: string) => void
  reactions?: Reaction[]
}

const QUICK_REACTIONS = ["❤️", "🔥", "😍", "🎉", "👏", "🚀", "💎", "🎊"]

export default function ReactionsPanel({ onReaction, reactions = [] }: ReactionsPanelProps) {
  return (
    <Card className="p-4 border-0 shadow-lg">
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
          <span className="text-xl">✨</span>
          Quick Reactions
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReaction?.(emoji)}
              className="aspect-square text-3xl p-2 bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 rounded-lg transition-all transform hover:scale-110 active:scale-95 border border-primary/20"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Floating Reactions Display */}
        {reactions.length > 0 && (
          <div className="text-xs text-muted-foreground font-medium">
            {reactions.length} reaction{reactions.length !== 1 ? "s" : ""} sent
          </div>
        )}
      </div>
    </Card>
  )
}
