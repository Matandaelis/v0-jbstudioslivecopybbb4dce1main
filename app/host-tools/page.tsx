"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Video,
  Settings,
  Gift,
  BarChart3,
  Users,
  MessageSquare,
  Palette,
  Clock,
  Plus,
  Edit,
  Trash2,
  Play,
  Sparkles,
  Wrench,
  ArrowRight,
  Layers,
  Mic,
  Camera,
  Monitor,
} from "lucide-react"

const SCHEDULED_STREAMS = [
  { id: 1, title: "Weekend Beauty Tips", date: "Sat, Dec 14", time: "2:00 PM", status: "scheduled" },
  { id: 2, title: "Sunday Skincare Special", date: "Sun, Dec 15", time: "4:00 PM", status: "scheduled" },
  { id: 3, title: "Product Launch Event", date: "Mon, Dec 16", time: "7:00 PM", status: "draft" },
]

const PRODUCTS_CATALOG = [
  { id: 1, name: "Glow Serum Set", price: 2500, stock: 45, active: true },
  { id: 2, name: "Matte Lipstick Collection", price: 1800, stock: 32, active: true },
  { id: 3, name: "Hair Growth Oil", price: 1500, stock: 28, active: false },
  { id: 4, name: "Face Mask Bundle", price: 3200, stock: 15, active: true },
]

const TOOLS = [
  {
    icon: <Video className="w-6 h-6" />,
    title: "Stream Scheduler",
    desc: "Plan and schedule your streams",
    href: "#scheduler",
  },
  {
    icon: <Gift className="w-6 h-6" />,
    title: "Product Manager",
    desc: "Manage your product catalog",
    href: "#products",
  },
  {
    icon: <Palette className="w-6 h-6" />,
    title: "Overlay Builder",
    desc: "Customize your stream overlays",
    href: "#overlays",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Auto Responses",
    desc: "Set up chat automation",
    href: "#chat",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Deep Dive",
    desc: "Advanced performance metrics",
    href: "#analytics",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Audience Manager",
    desc: "Segment and engage viewers",
    href: "#audience",
  },
]

export default function HostTools() {
  const [activeTab, setActiveTab] = useState<"scheduler" | "products" | "overlays" | "settings">("scheduler")
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div
        className={`${isBeauty ? "bg-gradient-to-r from-pink-600 to-pink-700" : "bg-gradient-to-r from-orange-600 to-orange-700"} text-white`}
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
              <h1 className="text-2xl md:text-3xl font-bold">Host Tools</h1>
              <p className="text-white/80 mt-1">Everything you need to run successful streams</p>
            </div>
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              <Play className="w-4 h-4 mr-2" /> Go Live Now
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "scheduler", label: "Stream Scheduler", icon: <Calendar className="w-4 h-4" /> },
              { key: "products", label: "Products", icon: <Gift className="w-4 h-4" /> },
              { key: "overlays", label: "Overlays", icon: <Layers className="w-4 h-4" /> },
              { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? isBeauty
                      ? "border-pink-500 text-pink-600"
                      : "border-orange-500 text-orange-600"
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
        {activeTab === "scheduler" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Scheduled Streams</h2>
                <Button className={isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}>
                  <Plus className="w-4 h-4 mr-2" /> New Stream
                </Button>
              </div>
              <div className="space-y-4">
                {SCHEDULED_STREAMS.map((stream) => (
                  <Card key={stream.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                          >
                            <Video className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{stream.title}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> {stream.date}
                              <Clock className="w-3 h-3 ml-2" /> {stream.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              stream.status === "scheduled"
                                ? "text-green-600 border-green-200"
                                : "text-yellow-600 border-yellow-200"
                            }
                          >
                            {stream.status}
                          </Badge>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-transparent text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {TOOLS.slice(0, 4).map((tool, idx) => (
                    <button
                      key={idx}
                      className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                      >
                        {tool.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{tool.title}</p>
                        <p className="text-xs text-slate-500">{tool.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Product Catalog</h2>
              <Button className={isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS_CATALOG.map((product) => (
                <Card key={product.id} className={!product.active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                      <Gift className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{product.name}</h3>
                    <p className={`font-bold ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                      KES {product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">Stock: {product.stock}</span>
                      <Badge variant="outline" className={product.active ? "text-green-600" : "text-slate-400"}>
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "overlays" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Stream Overlays</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Product Showcase", desc: "Display products during stream" },
                { name: "Live Chat Overlay", desc: "Show chat on screen" },
                { name: "Sales Ticker", desc: "Real-time sales notifications" },
                { name: "Countdown Timer", desc: "Flash sale countdown" },
                { name: "Lower Third", desc: "Host name and info" },
                { name: "Custom Alert", desc: "New follower/purchase alerts" },
              ].map((overlay, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="aspect-video bg-slate-900 rounded-lg mb-4 flex items-center justify-center">
                      <Monitor className="w-12 h-12 text-slate-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">{overlay.name}</h3>
                    <p className="text-sm text-slate-500">{overlay.desc}</p>
                    <Button variant="outline" size="sm" className="w-full mt-4 bg-transparent">
                      <Edit className="w-4 h-4 mr-2" /> Customize
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Stream Settings</h2>
            <div className="space-y-6">
              {[
                {
                  icon: <Camera className="w-5 h-5" />,
                  title: "Camera Settings",
                  desc: "Configure video quality and resolution",
                },
                {
                  icon: <Mic className="w-5 h-5" />,
                  title: "Audio Settings",
                  desc: "Microphone and sound configuration",
                },
                {
                  icon: <Monitor className="w-5 h-5" />,
                  title: "Display Settings",
                  desc: "Screen layout and presentation",
                },
                {
                  icon: <MessageSquare className="w-5 h-5" />,
                  title: "Chat Settings",
                  desc: "Moderation and auto-replies",
                },
                { icon: <Gift className="w-5 h-5" />, title: "Product Display", desc: "How products appear on stream" },
                {
                  icon: <Users className="w-5 h-5" />,
                  title: "Viewer Permissions",
                  desc: "Who can interact with your stream",
                },
              ].map((setting, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                        >
                          {setting.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{setting.title}</h3>
                          <p className="text-sm text-slate-500">{setting.desc}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
