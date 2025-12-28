"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Swords, Trophy, Users, Flame, Clock, Gift, Crown, Zap, Medal } from "lucide-react"

const ACTIVE_BATTLES = [
  {
    id: 1,
    title: "Holiday Sales Showdown",
    teamA: { name: "Team Glow", score: 125000, members: 5 },
    teamB: { name: "Team Radiance", score: 118000, members: 5 },
    prize: "KES 50,000",
    timeLeft: "2h 45m",
    status: "live",
  },
  {
    id: 2,
    title: "Weekend Warriors",
    teamA: { name: "Beauty Squad", score: 89000, members: 4 },
    teamB: { name: "Glow Getters", score: 92000, members: 4 },
    prize: "KES 30,000",
    timeLeft: "5h 20m",
    status: "live",
  },
]

const LEADERBOARD = [
  { rank: 1, name: "Sarah Kimani", wins: 24, points: 45000, streak: 5 },
  { rank: 2, name: "Grace Wanjiku", wins: 22, points: 42000, streak: 3 },
  { rank: 3, name: "Faith Nyambura", wins: 19, points: 38000, streak: 2 },
  { rank: 4, name: "Mike Odhiambo", wins: 18, points: 35000, streak: 4 },
  { rank: 5, name: "James Mutua", wins: 15, points: 32000, streak: 1 },
]

const UPCOMING_BATTLES = [
  { title: "New Year Championship", date: "Jan 1, 2025", prize: "KES 100,000", slots: "8/16" },
  { title: "Skincare Specialists", date: "Dec 20", prize: "KES 25,000", slots: "4/8" },
]

export default function BattleMode() {
  const [activeTab, setActiveTab] = useState<"live" | "leaderboard" | "upcoming" | "history">("live")

  return (
    <div className="min-h-screen bg-slate-900">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Swords className="w-8 h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">Battle Mode</h1>
              </div>
              <p className="text-white/80">Compete, conquer, and claim your rewards</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Trophy className="w-4 h-4 mr-2" /> My Battles
              </Button>
              <Button className="bg-white text-red-600 hover:bg-slate-100">
                <Swords className="w-4 h-4 mr-2" /> Join Battle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "live", label: "Live Battles", icon: <Flame className="w-4 h-4" /> },
              { key: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-4 h-4" /> },
              { key: "upcoming", label: "Upcoming", icon: <Clock className="w-4 h-4" /> },
              { key: "history", label: "History", icon: <Medal className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-red-500 text-red-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "live" && (
          <div className="space-y-6">
            {ACTIVE_BATTLES.map((battle) => (
              <Card key={battle.id} className="bg-slate-800 border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <h3 className="text-lg font-bold text-white">{battle.title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className="bg-yellow-500 text-black">
                        <Gift className="w-3 h-3 mr-1" /> {battle.prize}
                      </Badge>
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        <Clock className="w-3 h-3 mr-1" /> {battle.timeLeft}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Team A */}
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-white text-lg">{battle.teamA.name}</h4>
                      <p className="text-slate-400 text-sm">{battle.teamA.members} members</p>
                      <p className="text-3xl font-bold text-pink-400 mt-2">
                        KES {(battle.teamA.score / 1000).toFixed(0)}K
                      </p>
                    </div>

                    {/* VS */}
                    <div className="px-8">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Swords className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-center text-slate-500 mt-2 font-bold">VS</p>
                    </div>

                    {/* Team B */}
                    <div className="text-center flex-1">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-3">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="font-bold text-white text-lg">{battle.teamB.name}</h4>
                      <p className="text-slate-400 text-sm">{battle.teamB.members} members</p>
                      <p className="text-3xl font-bold text-cyan-400 mt-2">
                        KES {(battle.teamB.score / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="h-4 bg-slate-700 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all"
                        style={{ width: `${(battle.teamA.score / (battle.teamA.score + battle.teamB.score)) * 100}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                        style={{ width: `${(battle.teamB.score / (battle.teamA.score + battle.teamB.score)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                      <Zap className="w-4 h-4 mr-2" /> Watch Live
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" /> Battle Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {LEADERBOARD.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      player.rank <= 3
                        ? "bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-600/30"
                        : "bg-slate-700/50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          player.rank === 1
                            ? "bg-yellow-500 text-black"
                            : player.rank === 2
                              ? "bg-gray-300 text-black"
                              : player.rank === 3
                                ? "bg-amber-600 text-white"
                                : "bg-slate-600 text-white"
                        }`}
                      >
                        {player.rank === 1 ? <Crown className="w-5 h-5" /> : player.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{player.name}</p>
                        <p className="text-sm text-slate-400">{player.wins} wins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-4 h-4" />
                        <span className="font-semibold">{player.streak} streak</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-yellow-400">{player.points.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "upcoming" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {UPCOMING_BATTLES.map((battle, idx) => (
              <Card key={idx} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                      <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{battle.title}</h3>
                      <p className="text-sm text-slate-400">{battle.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-yellow-500 text-black">
                      <Gift className="w-3 h-3 mr-1" /> {battle.prize}
                    </Badge>
                    <span className="text-sm text-slate-400">Slots: {battle.slots}</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="text-center py-16">
            <Medal className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400">Your battle history will appear here</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
