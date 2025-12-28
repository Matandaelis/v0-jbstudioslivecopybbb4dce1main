"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Share2,
  Copy,
  Gift,
  Target,
  ArrowUpRight,
  UserPlus,
  Network,
  Trophy,
  Star,
  Sparkles,
  Wrench,
} from "lucide-react"

const AFFILIATE_STATS = {
  totalReferrals: 45,
  activeReferrals: 38,
  totalEarnings: 125000,
  pendingCommissions: 18500,
  currentTier: "Gold",
  tierProgress: 75,
}

const REFERRALS = [
  { name: "Sarah M.", joinDate: "Dec 5, 2024", sales: 23, commission: 4500, status: "active" },
  { name: "James K.", joinDate: "Nov 28, 2024", sales: 45, commission: 8200, status: "active" },
  { name: "Grace W.", joinDate: "Nov 15, 2024", sales: 12, commission: 2400, status: "active" },
  { name: "Peter O.", joinDate: "Nov 10, 2024", sales: 8, commission: 1600, status: "inactive" },
]

const TIERS = [
  { name: "Bronze", minReferrals: 0, commission: "5%", color: "bg-amber-600" },
  { name: "Silver", minReferrals: 10, commission: "8%", color: "bg-gray-400" },
  { name: "Gold", minReferrals: 25, commission: "12%", color: "bg-yellow-500" },
  { name: "Platinum", minReferrals: 50, commission: "15%", color: "bg-gray-300" },
  { name: "Diamond", minReferrals: 100, commission: "20%", color: "bg-cyan-400" },
]

export default function AffiliateHub() {
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"
  const referralCode = "JB-SARAH-2024"
  const referralLink = `https://jbstudios.live/ref/${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ProtectedRoute requiredRole={["admin", "affiliate", "host"]}>
      <div className="min-h-screen bg-slate-50">
        <Navigation />

        {/* Header */}
        <div
          className={`${isBeauty ? "bg-gradient-to-r from-pink-600 to-purple-700" : "bg-gradient-to-r from-orange-600 to-red-700"} text-white`}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex gap-2 mb-3">
                  <Button
                    size="sm"
                    onClick={() => setVertical("beauty")}
                    className={
                      vertical === "beauty" ? "bg-white text-pink-600" : "bg-white/20 text-white hover:bg-white/30"
                    }
                  >
                    <Sparkles className="w-4 h-4 mr-1" /> Beauty
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setVertical("auto")}
                    className={
                      vertical === "auto" ? "bg-white text-orange-600" : "bg-white/20 text-white hover:bg-white/30"
                    }
                  >
                    <Wrench className="w-4 h-4 mr-1" /> Auto
                  </Button>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Affiliate Hub</h1>
                <p className="text-white/80 mt-1">Grow your network and earn commissions</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" /> Share Link
                </Button>
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  <UserPlus className="w-4 h-4 mr-2" /> Invite Host
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-6 -mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Referrals",
                value: AFFILIATE_STATS.totalReferrals,
                icon: <Users className="w-5 h-5" />,
                change: "+5",
              },
              {
                label: "Active Hosts",
                value: AFFILIATE_STATS.activeReferrals,
                icon: <UserPlus className="w-5 h-5" />,
                change: "+3",
              },
              {
                label: "Total Earnings",
                value: `KES ${AFFILIATE_STATS.totalEarnings.toLocaleString()}`,
                icon: <DollarSign className="w-5 h-5" />,
                change: "+22%",
              },
              {
                label: "Pending",
                value: `KES ${AFFILIATE_STATS.pendingCommissions.toLocaleString()}`,
                icon: <TrendingUp className="w-5 h-5" />,
                change: null,
              },
            ].map((stat, idx) => (
              <Card key={idx} className="bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {stat.icon}
                    </div>
                    {stat.change && (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Referral Link */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="w-5 h-5" /> Your Referral Link
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 bg-slate-100 rounded-lg px-4 py-3 font-mono text-sm text-slate-700 truncate">
                      {referralLink}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(referralLink)}
                      className={isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-slate-50">
                      Code: {referralCode}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(referralCode)}
                      className="bg-transparent"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy Code
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Referrals List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Your Referrals</CardTitle>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {REFERRALS.map((ref, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
                            {ref.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{ref.name}</p>
                            <p className="text-sm text-slate-500">Joined {ref.joinDate}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                            KES {ref.commission.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-500">{ref.sales} sales</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            ref.status === "active"
                              ? "text-green-600 border-green-200"
                              : "text-slate-400 border-slate-200"
                          }
                        >
                          {ref.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Tier */}
              <Card
                className={`${isBeauty ? "bg-gradient-to-br from-pink-500 to-pink-600" : "bg-gradient-to-br from-orange-500 to-orange-600"} text-white`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8" />
                    <div>
                      <p className="text-sm text-white/80">Current Tier</p>
                      <p className="text-2xl font-bold">{AFFILIATE_STATS.currentTier}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Platinum</span>
                      <span>{AFFILIATE_STATS.tierProgress}%</span>
                    </div>
                    <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full"
                        style={{ width: `${AFFILIATE_STATS.tierProgress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-white/80">5 more referrals to reach Platinum</p>
                </CardContent>
              </Card>

              {/* Tier Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Commission Tiers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {TIERS.map((tier, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        tier.name === AFFILIATE_STATS.currentTier
                          ? isBeauty
                            ? "bg-pink-50 border border-pink-200"
                            : "bg-orange-50 border border-orange-200"
                          : "bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                        <span
                          className={`font-medium ${tier.name === AFFILIATE_STATS.currentTier ? "text-slate-900" : "text-slate-600"}`}
                        >
                          {tier.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-semibold ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                          {tier.commission}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">{tier.minReferrals}+ refs</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { icon: <Gift className="w-4 h-4" />, label: "Promo Materials", href: "#" },
                    { icon: <Target className="w-4 h-4" />, label: "Campaign Tools", href: "#" },
                    { icon: <Network className="w-4 h-4" />, label: "Network View", href: "#" },
                    { icon: <Star className="w-4 h-4" />, label: "Leaderboard", href: "#" },
                  ].map((action, idx) => (
                    <Button key={idx} variant="outline" className="w-full justify-start bg-transparent">
                      {action.icon}
                      <span className="ml-2">{action.label}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
