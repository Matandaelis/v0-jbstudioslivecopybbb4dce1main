"use client"

import { useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import {
  Play,
  Users,
  DollarSign,
  Eye,
  ShoppingBag,
  Clock,
  Calendar,
  BarChart3,
  ArrowUpRight,
  Video,
  MessageSquare,
  Heart,
  Share2,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react"

const PERFORMANCE_DATA = {
  today: { streams: 2, viewers: 3420, sales: 45, revenue: 12500 },
  week: { streams: 12, viewers: 28900, sales: 312, revenue: 89000 },
  month: { streams: 48, viewers: 125000, sales: 1240, revenue: 345000 },
}

const RECENT_STREAMS = [
  {
    id: 1,
    title: "Morning Skincare Routine",
    date: "Today, 9:00 AM",
    duration: "1h 23m",
    viewers: 1250,
    sales: 23,
    revenue: 6800,
    status: "completed",
  },
  {
    id: 2,
    title: "Evening Makeup Tutorial",
    date: "Yesterday, 7:00 PM",
    duration: "2h 15m",
    viewers: 2100,
    sales: 45,
    revenue: 12500,
    status: "completed",
  },
  {
    id: 3,
    title: "Product Unboxing Special",
    date: "2 days ago",
    duration: "1h 45m",
    viewers: 1890,
    sales: 38,
    revenue: 9200,
    status: "completed",
  },
]

const TOP_PRODUCTS = [
  { name: "Glow Serum Set", sales: 156, revenue: 45000, image: "/skincare-serum.png" },
  { name: "Matte Lipstick Collection", sales: 142, revenue: 38000, image: "/lipstick-makeup-product.jpg" },
  { name: "Hair Growth Oil", sales: 98, revenue: 29000, image: "/hair-oil-product.png" },
]

export default function HostDashboard() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week")
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"
  const data = PERFORMANCE_DATA[timeRange]

  return (
    <ProtectedRoute requiredRole={["admin", "host", "brand_partner"]}>
      <div className="min-h-screen bg-slate-50">
        <Navigation />

        {/* Header */}
        <div
          className={`${isBeauty ? "bg-gradient-to-r from-pink-600 to-pink-700" : "bg-gradient-to-r from-orange-600 to-orange-700"} text-white`}
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex gap-2">
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
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Host Dashboard</h1>
                <p className="text-white/80 mt-1">Welcome back! Here&apos;s your performance overview.</p>
              </div>
              <div className="flex gap-3">
                <Link href="/host-tools">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Button>
                </Link>
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  <Play className="w-4 h-4 mr-2" /> Go Live
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-2">
            {[
              { key: "today", label: "Today" },
              { key: "week", label: "This Week" },
              { key: "month", label: "This Month" },
            ].map((range) => (
              <Button
                key={range.key}
                variant={timeRange === range.key ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range.key as "today" | "week" | "month")}
                className={timeRange === range.key ? (isBeauty ? "bg-pink-500" : "bg-orange-500") : "bg-transparent"}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Streams", value: data.streams, icon: <Video className="w-5 h-5" />, change: "+2" },
              {
                label: "Total Viewers",
                value: data.viewers.toLocaleString(),
                icon: <Eye className="w-5 h-5" />,
                change: "+12%",
              },
              { label: "Products Sold", value: data.sales, icon: <ShoppingBag className="w-5 h-5" />, change: "+8%" },
              {
                label: "Revenue",
                value: `KES ${data.revenue.toLocaleString()}`,
                icon: <DollarSign className="w-5 h-5" />,
                change: "+15%",
              },
            ].map((stat, idx) => (
              <Card key={idx}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                    >
                      {stat.icon}
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Streams */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Streams</CardTitle>
                  <Link href="/host-tools">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {RECENT_STREAMS.map((stream) => (
                      <div key={stream.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{stream.title}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {stream.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {stream.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1 text-slate-600">
                              <Eye className="w-4 h-4" /> {stream.viewers.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <ShoppingBag className="w-4 h-4" /> {stream.sales}
                            </span>
                            <span className={`font-semibold ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                              KES {stream.revenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Chart Placeholder */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Viewer Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-slate-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Engagement analytics chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Products */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {TOP_PRODUCTS.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate text-sm">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sales} sold</p>
                      </div>
                      <p className={`font-semibold text-sm ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                        KES {(product.revenue / 1000).toFixed(0)}K
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Engagement Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: <MessageSquare className="w-4 h-4" />, label: "Chat Messages", value: "12.4K" },
                    { icon: <Heart className="w-4 h-4" />, label: "Likes Received", value: "8.9K" },
                    { icon: <Share2 className="w-4 h-4" />, label: "Stream Shares", value: "2.3K" },
                    { icon: <Users className="w-4 h-4" />, label: "New Followers", value: "+890" },
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                        >
                          {stat.icon}
                        </div>
                        <span className="text-sm text-slate-600">{stat.label}</span>
                      </div>
                      <span className="font-semibold text-slate-900">{stat.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Stream */}
              <Card className={`${isBeauty ? "bg-pink-50 border-pink-200" : "bg-orange-50 border-orange-200"}`}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className={`w-5 h-5 ${isBeauty ? "text-pink-600" : "text-orange-600"}`} />
                    <h3 className="font-semibold text-slate-900">Next Scheduled Stream</h3>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">Weekend Beauty Tips</p>
                  <p className="text-sm text-slate-600 mb-4">Saturday, 2:00 PM EAT</p>
                  <Button
                    className={`w-full ${isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}`}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Early
                  </Button>
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
