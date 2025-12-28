"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Target,
  Mail,
  MessageSquare,
  Globe,
  Megaphone,
  Eye,
  DollarSign,
  ArrowUpRight,
  Zap,
  PieChart,
} from "lucide-react"

const CAMPAIGN_METRICS = {
  totalReach: 4500000,
  engagement: 12.5,
  conversions: 45000,
  revenue: 8900000,
  activeCampaigns: 8,
  channels: 6,
}

const ACTIVE_CAMPAIGNS = [
  { name: "Holiday Season Push", channel: "Multi-channel", reach: 1200000, conversions: 15000, status: "active" },
  { name: "New Year Beauty", channel: "Social Media", reach: 890000, conversions: 8500, status: "active" },
  { name: "Auto Parts Sale", channel: "Email + SMS", reach: 450000, conversions: 5200, status: "active" },
]

const CHANNEL_PERFORMANCE = [
  { channel: "Social Media", reach: 2100000, engagement: 15.2, conversions: 18000 },
  { channel: "Email", reach: 1200000, engagement: 22.5, conversions: 12000 },
  { channel: "SMS", reach: 800000, engagement: 18.3, conversions: 8000 },
  { channel: "Push Notifications", reach: 400000, engagement: 8.5, conversions: 7000 },
]

export default function Marketing360Dashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Marketing 360</h1>
              </div>
              <p className="text-white/80">Unified marketing command center</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" /> Reports
              </Button>
              <Button className="bg-white text-blue-600 hover:bg-slate-100">
                <Megaphone className="w-4 h-4 mr-2" /> New Campaign
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
              label: "Total Reach",
              value: `${(CAMPAIGN_METRICS.totalReach / 1000000).toFixed(1)}M`,
              icon: <Eye className="w-5 h-5" />,
              change: "+28%",
            },
            {
              label: "Engagement Rate",
              value: `${CAMPAIGN_METRICS.engagement}%`,
              icon: <TrendingUp className="w-5 h-5" />,
              change: "+3.2%",
            },
            {
              label: "Conversions",
              value: `${(CAMPAIGN_METRICS.conversions / 1000).toFixed(0)}K`,
              icon: <Target className="w-5 h-5" />,
              change: "+18%",
            },
            {
              label: "Revenue",
              value: `KES ${(CAMPAIGN_METRICS.revenue / 1000000).toFixed(1)}M`,
              icon: <DollarSign className="w-5 h-5" />,
              change: "+25%",
            },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                    {stat.icon}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2">
          {["week", "month", "quarter"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={timeRange === range ? "bg-blue-500" : "bg-transparent"}
            >
              This {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ACTIVE_CAMPAIGNS.map((campaign, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                          <p className="text-sm text-slate-500">{campaign.channel}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Reach</p>
                          <p className="font-semibold text-slate-900">{(campaign.reach / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Conversions</p>
                          <p className="font-semibold text-blue-600">{campaign.conversions.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {CHANNEL_PERFORMANCE.map((channel, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                          {channel.channel === "Social Media" ? (
                            <Globe className="w-5 h-5" />
                          ) : channel.channel === "Email" ? (
                            <Mail className="w-5 h-5" />
                          ) : channel.channel === "SMS" ? (
                            <MessageSquare className="w-5 h-5" />
                          ) : (
                            <Zap className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-medium text-slate-900">{channel.channel}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="text-slate-500">Reach</p>
                          <p className="font-semibold">{(channel.reach / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500">Engagement</p>
                          <p className="font-semibold">{channel.engagement}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-500">Conversions</p>
                          <p className="font-semibold text-blue-600">{(channel.conversions / 1000).toFixed(0)}K</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { icon: <Megaphone className="w-4 h-4" />, label: "Create Campaign" },
                  { icon: <Mail className="w-4 h-4" />, label: "Email Broadcast" },
                  { icon: <MessageSquare className="w-4 h-4" />, label: "SMS Campaign" },
                  { icon: <Globe className="w-4 h-4" />, label: "Social Post" },
                ].map((action, idx) => (
                  <Button key={idx} variant="outline" className="w-full justify-start bg-transparent">
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Audience Segments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "High-Value Customers", count: 12500 },
                  { name: "New Subscribers", count: 8900 },
                  { name: "Engaged Viewers", count: 25000 },
                  { name: "Cart Abandoners", count: 3400 },
                ].map((segment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-700">{segment.name}</span>
                    <Badge variant="outline">{segment.count.toLocaleString()}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-5">
                <PieChart className="w-8 h-8 mb-3" />
                <h3 className="font-semibold mb-1">Customer Journey Analytics</h3>
                <p className="text-sm text-white/80 mb-4">Track user behavior from awareness to conversion.</p>
                <Button className="w-full bg-white text-blue-600 hover:bg-slate-100">View Insights</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
