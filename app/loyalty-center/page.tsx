"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Gift,
  Star,
  Trophy,
  Crown,
  Gem,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Users,
  ShoppingBag,
  Ticket,
} from "lucide-react"

export default function LoyaltyCenterPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const loyaltyTiers = [
    { name: "Bronze", points: "0-999", benefits: 3, icon: Star, color: "bg-amber-700", current: false },
    { name: "Silver", points: "1,000-4,999", benefits: 5, icon: Gem, color: "bg-gray-400", current: true },
    { name: "Gold", points: "5,000-14,999", benefits: 8, icon: Crown, color: "bg-yellow-500", current: false },
    { name: "Platinum", points: "15,000+", benefits: 12, icon: Trophy, color: "bg-purple-500", current: false },
  ]

  const rewards = [
    { name: "Free Shipping", points: 500, icon: ShoppingBag },
    { name: "10% Discount", points: 1000, icon: Ticket },
    { name: "VIP Access", points: 2500, icon: Crown },
    { name: "Exclusive Merch", points: 5000, icon: Gift },
  ]

  const recentActivity = [
    { action: "Purchase completed", points: "+150", time: "2 hours ago" },
    { action: "Referral bonus", points: "+500", time: "1 day ago" },
    { action: "Daily check-in", points: "+25", time: "1 day ago" },
    { action: "Review submitted", points: "+50", time: "3 days ago" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <h1 className="text-3xl font-bold">Loyalty Center</h1>
            </div>
            <p className="text-muted-foreground">Earn points, unlock rewards, and enjoy exclusive benefits</p>
          </div>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">2,450</div>
                <div className="text-sm text-muted-foreground">Available Points</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Current Tier Progress */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gray-400/20 rounded-full">
                  <Gem className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <Badge className="bg-gray-400 mb-1">Silver Member</Badge>
                  <p className="text-sm text-muted-foreground">2,550 more points to Gold</p>
                </div>
              </div>
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to Gold</span>
                  <span>2,450 / 5,000</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-400 to-yellow-500 rounded-full"
                    style={{ width: "49%" }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["overview", "rewards", "history", "tiers"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tier Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              {loyaltyTiers.map((tier) => (
                <Card key={tier.name} className={`relative ${tier.current ? "ring-2 ring-primary" : ""}`}>
                  {tier.current && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">Current</Badge>}
                  <CardContent className="pt-6 text-center">
                    <div
                      className={`w-12 h-12 ${tier.color} rounded-full flex items-center justify-center mx-auto mb-3`}
                    >
                      <tier.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold">{tier.name}</h3>
                    <p className="text-xs text-muted-foreground">{tier.points} pts</p>
                    <p className="text-xs mt-2">{tier.benefits} benefits</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ways to Earn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Ways to Earn Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { action: "Make a purchase", points: "1 pt / $1", icon: ShoppingBag },
                    { action: "Refer a friend", points: "+500 pts", icon: Users },
                    { action: "Daily check-in", points: "+25 pts", icon: Clock },
                    { action: "Write a review", points: "+50 pts", icon: Star },
                    { action: "Social share", points: "+30 pts", icon: TrendingUp },
                    { action: "Birthday bonus", points: "+1000 pts", icon: Gift },
                  ].map((item) => (
                    <div key={item.action} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{item.action}</span>
                      </div>
                      <Badge variant="secondary">{item.points}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Available Rewards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-pink-500" />
                  Available Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {rewards.map((reward) => (
                    <div key={reward.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-pink-500/10 rounded-lg">
                          <reward.icon className="h-5 w-5 text-pink-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{reward.name}</h4>
                          <p className="text-sm text-muted-foreground">{reward.points} points</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Redeem
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="secondary" className="text-green-500">
                      {activity.points}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500/10 to-purple-500/10">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <h3 className="font-bold text-lg mb-2">Refer & Earn</h3>
                <p className="text-sm text-muted-foreground mb-4">Get 500 bonus points for each friend you refer!</p>
                <Button className="w-full bg-pink-500 hover:bg-pink-600">Share Referral Link</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
