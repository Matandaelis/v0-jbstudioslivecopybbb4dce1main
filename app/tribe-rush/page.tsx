"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Flame,
  Users,
  Trophy,
  Zap,
  Clock,
  Target,
  Star,
  Crown,
  Swords,
  Shield,
  Heart,
  Gift,
  ChevronRight,
} from "lucide-react"

export default function TribeRushPage() {
  const [activeEvent, setActiveEvent] = useState("main")

  const tribes = [
    { name: "Phoenix Squad", members: 234, points: 125400, rank: 1, color: "bg-orange-500", streak: 12 },
    { name: "Thunder Wolves", members: 198, points: 118200, rank: 2, color: "bg-blue-500", streak: 8 },
    { name: "Shadow Hawks", members: 212, points: 112800, rank: 3, color: "bg-purple-500", streak: 5 },
    { name: "Iron Lions", members: 187, points: 98500, rank: 4, color: "bg-yellow-500", streak: 3 },
  ]

  const challenges = [
    { name: "Sales Sprint", reward: "5000 pts", timeLeft: "2h 30m", progress: 75, type: "individual" },
    { name: "Referral Rally", reward: "10000 pts", timeLeft: "1d 4h", progress: 45, type: "tribe" },
    { name: "Stream Marathon", reward: "7500 pts", timeLeft: "5h 15m", progress: 90, type: "individual" },
  ]

  const leaderboard = [
    { name: "Sarah M.", tribe: "Phoenix Squad", points: 8450, avatar: "S" },
    { name: "John D.", tribe: "Thunder Wolves", points: 7890, avatar: "J" },
    { name: "Mike R.", tribe: "Phoenix Squad", points: 7234, avatar: "M" },
    { name: "Lisa K.", tribe: "Shadow Hawks", points: 6980, avatar: "L" },
    { name: "Tom B.", tribe: "Iron Lions", points: 6540, avatar: "T" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header with Live Event Banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-none animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                LIVE EVENT
              </Badge>
              <span className="text-sm opacity-80">Ends in 2d 14h 32m</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">Tribe Rush Championship</h1>
            <p className="text-lg opacity-90 max-w-2xl">
              Compete with your tribe to earn massive rewards! Top 3 tribes win exclusive prizes.
            </p>
            <div className="flex gap-4 mt-6">
              <Button className="bg-white text-orange-500 hover:bg-white/90">
                <Users className="h-4 w-4 mr-2" />
                Join a Tribe
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                View Rules
              </Button>
            </div>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
            <Trophy className="h-32 w-32 text-white/20" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Your Points", value: "4,250", icon: Star, color: "text-yellow-500" },
            { label: "Tribe Rank", value: "#2", icon: Trophy, color: "text-orange-500" },
            { label: "Win Streak", value: "5 days", icon: Flame, color: "text-red-500" },
            { label: "Challenges Done", value: "12/15", icon: Target, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tribe Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-orange-500" />
                  Tribe Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tribes.map((tribe, i) => (
                  <div
                    key={tribe.name}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      i === 0 ? "border-orange-500 bg-orange-500/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 ${tribe.color} rounded-full flex items-center justify-center text-white font-bold`}
                      >
                        {tribe.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{tribe.name}</h4>
                          {i === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tribe.members} members - {tribe.streak} day streak
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{tribe.points.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Active Challenges
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.name} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{challenge.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {challenge.timeLeft} remaining
                        </p>
                      </div>
                      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500">
                        <Gift className="h-3 w-3 mr-1" />
                        {challenge.reward}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{challenge.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                          style={{ width: `${challenge.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Top Players */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Top Players
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.map((player, i) => (
                  <div key={player.name} className="flex items-center gap-3">
                    <span
                      className={`w-6 text-center font-bold ${
                        i === 0
                          ? "text-yellow-500"
                          : i === 1
                            ? "text-gray-400"
                            : i === 2
                              ? "text-amber-700"
                              : "text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center font-medium">
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{player.name}</p>
                      <p className="text-xs text-muted-foreground">{player.tribe}</p>
                    </div>
                    <span className="font-bold text-sm">{player.points.toLocaleString()}</span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2 bg-transparent">
                  Full Leaderboard <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            {/* Your Tribe */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Thunder Wolves</h3>
                    <p className="text-sm text-muted-foreground">Your Tribe</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">198</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <p className="text-2xl font-bold">#2</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                </div>
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <Heart className="h-4 w-4 mr-2" />
                  Tribe Chat
                </Button>
              </CardContent>
            </Card>

            {/* Rewards Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: "1st Place", reward: "$5,000 + Gold Badge", icon: Crown, color: "text-yellow-500" },
                  { rank: "2nd Place", reward: "$2,500 + Silver Badge", icon: Trophy, color: "text-gray-400" },
                  { rank: "3rd Place", reward: "$1,000 + Bronze Badge", icon: Trophy, color: "text-amber-700" },
                ].map((prize) => (
                  <div key={prize.rank} className="flex items-center gap-3 p-3 border rounded-lg">
                    <prize.icon className={`h-5 w-5 ${prize.color}`} />
                    <div>
                      <p className="font-medium text-sm">{prize.rank}</p>
                      <p className="text-xs text-muted-foreground">{prize.reward}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
