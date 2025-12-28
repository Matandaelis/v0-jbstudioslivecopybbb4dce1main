"use client"

import { useState } from "react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Users,
  DollarSign,
  Award,
  TrendingUp,
  Calendar,
  Video,
  BarChart3,
  Gift,
  Settings,
  Sparkles,
  Wrench,
  ArrowRight,
  Clock,
  Target,
  Zap,
} from "lucide-react"

const QUICK_ACTIONS = [
  {
    icon: <Play className="w-5 h-5" />,
    label: "Go Live",
    href: "/host-dashboard",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Schedule Stream",
    href: "/host-tools",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    label: "View Analytics",
    href: "/host-dashboard",
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    icon: <Gift className="w-5 h-5" />,
    label: "Manage Products",
    href: "/host-tools",
    color: "bg-purple-500 hover:bg-purple-600",
  },
]

const STATS = [
  { label: "Total Earnings", value: "KES 245,000", change: "+12%", icon: <DollarSign className="w-5 h-5" /> },
  { label: "Total Views", value: "125K", change: "+8%", icon: <Users className="w-5 h-5" /> },
  { label: "Products Sold", value: "892", change: "+15%", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Current Tier", value: "Gold", change: "Level 3", icon: <Award className="w-5 h-5" /> },
]

const UPCOMING_STREAMS = [
  { title: "Weekend Beauty Tips", date: "Sat, 2:00 PM", category: "beauty", viewers: "500+" },
  { title: "Car Care Essentials", date: "Sun, 10:00 AM", category: "auto", viewers: "300+" },
]

export default function HostPortal() {
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div
        className={`${isBeauty ? "bg-gradient-to-br from-pink-600 to-pink-800" : "bg-gradient-to-br from-orange-600 to-orange-800"} text-white`}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex gap-2 mb-4">
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Host Command Center</h1>
              <p className="text-white/80">Manage your streams, track earnings, and grow your audience</p>
            </div>
            <div className="flex gap-3">
              {QUICK_ACTIONS.slice(0, 2).map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Button className={`${action.color} text-white`}>
                    {action.icon}
                    <span className="ml-2">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, idx) => (
            <Card key={idx} className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    {stat.icon}
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
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
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: <Play className="w-6 h-6" />,
                  title: "Start Live Stream",
                  desc: "Go live and connect with your audience",
                  href: "/host-dashboard",
                  color: isBeauty ? "bg-pink-500" : "bg-orange-500",
                },
                {
                  icon: <Video className="w-6 h-6" />,
                  title: "Stream Schedule",
                  desc: "Plan and schedule upcoming streams",
                  href: "/host-tools",
                  color: "bg-blue-500",
                },
                {
                  icon: <BarChart3 className="w-6 h-6" />,
                  title: "Analytics Dashboard",
                  desc: "Track performance and insights",
                  href: "/host-dashboard",
                  color: "bg-green-500",
                },
                {
                  icon: <Gift className="w-6 h-6" />,
                  title: "Product Catalog",
                  desc: "Manage products for your streams",
                  href: "/host-tools",
                  color: "bg-purple-500",
                },
                {
                  icon: <Users className="w-6 h-6" />,
                  title: "Audience Insights",
                  desc: "Understand your viewers",
                  href: "/host-dashboard",
                  color: "bg-indigo-500",
                },
                {
                  icon: <Settings className="w-6 h-6" />,
                  title: "Stream Settings",
                  desc: "Configure your streaming setup",
                  href: "/host-tools",
                  color: "bg-slate-500",
                },
              ].map((action, idx) => (
                <Link key={idx} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-5 flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${action.color}`}
                      >
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                        <p className="text-sm text-slate-500">{action.desc}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Streams */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" /> Upcoming Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {UPCOMING_STREAMS.map((stream, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{stream.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {stream.date}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        stream.category === "beauty"
                          ? "border-pink-300 text-pink-600"
                          : "border-orange-300 text-orange-600"
                      }
                    >
                      {stream.viewers}
                    </Badge>
                  </div>
                ))}
                <Link href="/host-tools">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" /> Schedule New
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" /> This Month&apos;s Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Stream Hours", current: 32, target: 40 },
                  { label: "Products Sold", current: 156, target: 200 },
                  { label: "New Followers", current: 890, target: 1000 },
                ].map((goal, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{goal.label}</span>
                      <span className="font-medium">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isBeauty ? "bg-pink-500" : "bg-orange-500"}`}
                        style={{ width: `${(goal.current / goal.target) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className={`${isBeauty ? "bg-pink-50 border-pink-200" : "bg-orange-50 border-orange-200"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className={`w-5 h-5 ${isBeauty ? "text-pink-600" : "text-orange-600"}`} />
                  <h3 className="font-semibold text-slate-900">Pro Tip</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Streams between 7-9 PM get 40% more viewers. Try scheduling your next stream during peak hours!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
