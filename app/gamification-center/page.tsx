"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Trophy,
  Star,
  Gift,
  Flame,
  Target,
  Award,
  Zap,
  Crown,
  TrendingUp,
  Coins,
  Lock,
  CheckCircle,
} from "lucide-react"

const USER_STATS = {
  level: 24,
  xp: 8500,
  xpToNext: 10000,
  coins: 12500,
  streak: 7,
  badges: 18,
}

const ACHIEVEMENTS = [
  { name: "First Stream", desc: "Complete your first live stream", earned: true, xp: 100 },
  { name: "Engagement Master", desc: "Reach 1000 chat messages", earned: true, xp: 500 },
  { name: "Sales Superstar", desc: "Sell 100 products", earned: true, xp: 1000 },
  { name: "Community Builder", desc: "Gain 500 followers", earned: false, xp: 750, progress: 65 },
  { name: "Streak Legend", desc: "Stream 30 days in a row", earned: false, xp: 2000, progress: 23 },
]

const DAILY_CHALLENGES = [
  { name: "Stream for 1 hour", reward: 50, completed: true },
  { name: "Sell 5 products", reward: 100, completed: false, progress: 60 },
  { name: "Get 50 chat messages", reward: 75, completed: false, progress: 80 },
  { name: "Share stream on social", reward: 25, completed: true },
]

const REWARDS = [
  { name: "Profile Badge", cost: 500, type: "cosmetic" },
  { name: "Priority Support", cost: 1000, type: "perk" },
  { name: "KES 500 Credit", cost: 2500, type: "cash" },
  { name: "Featured Spot", cost: 5000, type: "promotion" },
]

export default function GamificationCenter() {
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "achievements" | "rewards">("overview")
  const xpProgress = (USER_STATS.xp / USER_STATS.xpToNext) * 100

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Gamification Center</h1>
              </div>
              <p className="text-white/80">Earn rewards and unlock achievements</p>
            </div>

            {/* User Stats */}
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold">Lvl {USER_STATS.level}</span>
                </div>
                <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden w-24">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${xpProgress}%` }} />
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {USER_STATS.xp}/{USER_STATS.xpToNext} XP
                </p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-2xl font-bold">{USER_STATS.coins.toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Coins</p>
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-3 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="text-2xl font-bold">{USER_STATS.streak}</span>
                </div>
                <p className="text-xs text-white/70 mt-1">Day Streak</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "overview", label: "Overview", icon: <TrendingUp className="w-4 h-4" /> },
              { key: "challenges", label: "Daily Challenges", icon: <Target className="w-4 h-4" /> },
              { key: "achievements", label: "Achievements", icon: <Award className="w-4 h-4" /> },
              { key: "rewards", label: "Rewards Shop", icon: <Gift className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
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
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Daily Challenges Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" /> Today&apos;s Challenges
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("challenges")}
                    className="bg-transparent"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DAILY_CHALLENGES.slice(0, 3).map((challenge, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {challenge.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                          )}
                          <span className={challenge.completed ? "text-slate-400 line-through" : "text-slate-700"}>
                            {challenge.name}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-purple-600">
                          +{challenge.reward} coins
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Preview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> Recent Achievements
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("achievements")}
                    className="bg-transparent"
                  >
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ACHIEVEMENTS.filter((a) => a.earned)
                      .slice(0, 4)
                      .map((achievement, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{achievement.name}</p>
                            <p className="text-xs text-slate-500">+{achievement.xp} XP</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                <CardContent className="p-6">
                  <Crown className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Level {USER_STATS.level}</h3>
                  <p className="text-white/80 text-sm mb-4">
                    {USER_STATS.xpToNext - USER_STATS.xp} XP to reach Level {USER_STATS.level + 1}
                  </p>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${xpProgress}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Total XP Earned", value: "45,200" },
                    { label: "Badges Unlocked", value: `${USER_STATS.badges}/50` },
                    { label: "Challenges Completed", value: "156" },
                    { label: "Rewards Claimed", value: "23" },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{stat.label}</span>
                      <span className="font-semibold text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="space-y-4">
            {DAILY_CHALLENGES.map((challenge, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {challenge.completed ? (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                          <Target className="w-6 h-6 text-purple-500" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-slate-900">{challenge.name}</h4>
                        {!challenge.completed && challenge.progress && (
                          <div className="mt-2 w-48">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${challenge.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{challenge.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={challenge.completed ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}
                    >
                      <Coins className="w-3 h-3 mr-1" /> +{challenge.reward}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACHIEVEMENTS.map((achievement, idx) => (
              <Card key={idx} className={!achievement.earned ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      achievement.earned ? "bg-yellow-400" : "bg-slate-200"
                    }`}
                  >
                    {achievement.earned ? (
                      <Trophy className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 text-center mb-1">{achievement.name}</h3>
                  <p className="text-sm text-slate-500 text-center mb-3">{achievement.desc}</p>
                  {!achievement.earned && achievement.progress && (
                    <div className="mb-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${achievement.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-1">{achievement.progress}%</p>
                    </div>
                  )}
                  <Badge variant="outline" className="w-full justify-center">
                    <Zap className="w-3 h-3 mr-1" /> +{achievement.xp} XP
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {REWARDS.map((reward, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-center mb-1">{reward.name}</h3>
                  <Badge variant="outline" className="w-full justify-center mb-4">
                    {reward.type}
                  </Badge>
                  <Button
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={USER_STATS.coins < reward.cost}
                  >
                    <Coins className="w-4 h-4 mr-1" /> {reward.cost}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
