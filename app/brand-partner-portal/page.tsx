"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Users,
  Video,
  BarChart3,
  MessageSquare,
  ArrowUpRight,
  Eye,
  Star,
  Megaphone,
} from "lucide-react"

const BRAND_STATS = {
  totalCampaigns: 12,
  activeCampaigns: 5,
  totalReach: 2500000,
  totalSales: 4500000,
  partneredHosts: 45,
  avgROI: 340,
}

const CAMPAIGNS = [
  {
    id: 1,
    name: "Holiday Beauty Blitz",
    status: "active",
    hosts: 12,
    reach: 450000,
    sales: 890000,
    startDate: "Dec 1",
    endDate: "Dec 31",
  },
  {
    id: 2,
    name: "Skincare Essentials",
    status: "active",
    hosts: 8,
    reach: 320000,
    sales: 560000,
    startDate: "Nov 15",
    endDate: "Dec 15",
  },
  {
    id: 3,
    name: "New Year Glow",
    status: "scheduled",
    hosts: 15,
    reach: 0,
    sales: 0,
    startDate: "Jan 1",
    endDate: "Jan 31",
  },
  {
    id: 4,
    name: "Summer Collection",
    status: "completed",
    hosts: 20,
    reach: 890000,
    sales: 1200000,
    startDate: "Jul 1",
    endDate: "Aug 31",
  },
]

const TOP_HOSTS = [
  { name: "Sarah Kimani", sales: 125000, streams: 24, rating: 4.9 },
  { name: "Grace Wanjiku", sales: 98000, streams: 18, rating: 4.8 },
  { name: "Faith Nyambura", sales: 87000, streams: 15, rating: 4.9 },
]

export default function BrandPartnerPortal() {
  const [activeTab, setActiveTab] = useState<"overview" | "campaigns" | "hosts" | "analytics">("overview")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Brand Partner Portal</h1>
              <p className="text-white/80 mt-1">Manage campaigns and track performance</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" /> Reports
              </Button>
              <Button className="bg-white text-purple-600 hover:bg-slate-100">
                <Megaphone className="w-4 h-4 mr-2" /> New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
              { key: "campaigns", label: "Campaigns", icon: <Megaphone className="w-4 h-4" /> },
              { key: "hosts", label: "Partner Hosts", icon: <Users className="w-4 h-4" /> },
              { key: "analytics", label: "Analytics", icon: <TrendingUp className="w-4 h-4" /> },
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
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Reach",
                  value: `${(BRAND_STATS.totalReach / 1000000).toFixed(1)}M`,
                  icon: <Eye className="w-5 h-5" />,
                  change: "+25%",
                },
                {
                  label: "Total Sales",
                  value: `KES ${(BRAND_STATS.totalSales / 1000000).toFixed(1)}M`,
                  icon: <DollarSign className="w-5 h-5" />,
                  change: "+32%",
                },
                {
                  label: "Partner Hosts",
                  value: BRAND_STATS.partneredHosts,
                  icon: <Users className="w-5 h-5" />,
                  change: "+8",
                },
                {
                  label: "Avg ROI",
                  value: `${BRAND_STATS.avgROI}%`,
                  icon: <TrendingUp className="w-5 h-5" />,
                  change: "+15%",
                },
              ].map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
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

            {/* Active Campaigns & Top Hosts */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {CAMPAIGNS.filter((c) => c.status === "active").map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{campaign.name}</h4>
                          <Badge className="bg-green-100 text-green-700">Active</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Hosts</p>
                            <p className="font-semibold">{campaign.hosts}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Reach</p>
                            <p className="font-semibold">{(campaign.reach / 1000).toFixed(0)}K</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Sales</p>
                            <p className="font-semibold text-purple-600">KES {(campaign.sales / 1000).toFixed(0)}K</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Hosts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {TOP_HOSTS.map((host, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center font-semibold text-purple-600">
                            {host.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{host.name}</p>
                            <p className="text-xs text-slate-500">{host.streams} streams</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-purple-600">KES {(host.sales / 1000).toFixed(0)}K</p>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {host.rating}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "campaigns" && (
          <div className="space-y-4">
            {CAMPAIGNS.map((campaign) => (
              <Card key={campaign.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                        <Badge
                          variant="outline"
                          className={
                            campaign.status === "active"
                              ? "text-green-600 border-green-200 bg-green-50"
                              : campaign.status === "scheduled"
                                ? "text-blue-600 border-blue-200 bg-blue-50"
                                : "text-slate-600 border-slate-200 bg-slate-50"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {campaign.startDate} - {campaign.endDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{campaign.hosts}</p>
                        <p className="text-xs text-slate-500">Hosts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{(campaign.reach / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-500">Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">KES {(campaign.sales / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-slate-500">Sales</p>
                      </div>
                      <Button variant="outline" className="bg-transparent">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "hosts" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...TOP_HOSTS, ...TOP_HOSTS].map((host, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center font-bold text-xl text-purple-600">
                      {host.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{host.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {host.rating} rating
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-slate-900">{host.streams}</p>
                      <p className="text-xs text-slate-500">Streams</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-purple-600">KES {(host.sales / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-slate-500">Sales</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <MessageSquare className="w-4 h-4 mr-1" /> Message
                    </Button>
                    <Button size="sm" className="flex-1 bg-purple-500 hover:bg-purple-600">
                      <Video className="w-4 h-4 mr-1" /> Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Host</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-12 h-12 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
