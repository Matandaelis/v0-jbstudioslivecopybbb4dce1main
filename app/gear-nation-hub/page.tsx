"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wrench, Car, Video, Play, Star, ShoppingBag, Eye, Award, Settings } from "lucide-react"

const LIVE_STREAMS = [
  { id: 1, host: "Mike Odhiambo", title: "BMW E46 Full Service", viewers: 892, category: "Maintenance" },
  { id: 2, host: "James Mutua", title: "Toyota Hilux Lift Kit Install", viewers: 567, category: "Modifications" },
  { id: 3, host: "Peter Kamau", title: "Subaru WRX Turbo Upgrade", viewers: 1234, category: "Performance" },
]

const FEATURED_PRODUCTS = [
  { name: "Castrol Edge 5W-30", price: 4500, sales: 234, rating: 4.9 },
  { name: "NGK Spark Plugs Set", price: 2800, sales: 189, rating: 4.8 },
  { name: "Bosch Brake Pads", price: 6500, sales: 145, rating: 4.7 },
  { name: "K&N Air Filter", price: 8900, sales: 98, rating: 4.9 },
]

const TOP_MECHANICS = [
  { name: "Mike Odhiambo", specialty: "German Cars", rating: 4.9, jobs: 456 },
  { name: "James Mutua", specialty: "Japanese Cars", rating: 4.8, jobs: 389 },
  { name: "Peter Kamau", specialty: "Performance", rating: 4.9, jobs: 234 },
]

export default function GearNationHub() {
  const [activeTab, setActiveTab] = useState<"live" | "products" | "mechanics" | "learn">("live")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <Car className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">GearNation Hub</h1>
                <p className="text-white/80 mt-1">East Africa&apos;s premier auto community</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold">2.5K+</p>
                <p className="text-xs text-white/70">Active Mechanics</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold">15K+</p>
                <p className="text-xs text-white/70">Products</p>
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
              { key: "live", label: "Live Streams", icon: <Video className="w-4 h-4" /> },
              { key: "products", label: "Products", icon: <ShoppingBag className="w-4 h-4" /> },
              { key: "mechanics", label: "Mechanics", icon: <Wrench className="w-4 h-4" /> },
              { key: "learn", label: "Learn", icon: <Award className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-orange-500 text-orange-600"
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
        {activeTab === "live" && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Now
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {LIVE_STREAMS.map((stream) => (
                  <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-slate-900 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white/50" />
                      </div>
                      <Badge className="absolute top-3 left-3 bg-red-500">LIVE</Badge>
                      <Badge className="absolute bottom-3 left-3 bg-black/70">
                        <Eye className="w-3 h-3 mr-1" /> {stream.viewers}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-1">{stream.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">{stream.host}</span>
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          {stream.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Top Mechanics This Week</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {TOP_MECHANICS.map((mechanic, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-semibold text-orange-600">
                        {mechanic.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm">{mechanic.name}</p>
                        <p className="text-xs text-slate-500">{mechanic.specialty}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {mechanic.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <Wrench className="w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Become a GearNation Mechanic</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Stream your work, share knowledge, and earn from your expertise.
                  </p>
                  <Button className="w-full bg-white text-orange-600 hover:bg-slate-100">Apply Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                    <Settings className="w-12 h-12 text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-slate-600">{product.rating}</span>
                    <span className="text-xs text-slate-400">({product.sales} sold)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-orange-600">KES {product.price.toLocaleString()}</p>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      <ShoppingBag className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "mechanics" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...TOP_MECHANICS, ...TOP_MECHANICS].map((mechanic, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center font-bold text-xl text-orange-600">
                      {mechanic.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{mechanic.name}</h3>
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {mechanic.specialty}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{mechanic.rating}</span>
                      </div>
                      <p className="text-xs text-slate-500">Rating</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="font-bold">{mechanic.jobs}</p>
                      <p className="text-xs text-slate-500">Jobs Done</p>
                    </div>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">View Profile</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "learn" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Basic Car Maintenance", lessons: 12, duration: "2 hrs", level: "Beginner" },
              { title: "Engine Diagnostics", lessons: 18, duration: "4 hrs", level: "Intermediate" },
              { title: "Performance Tuning", lessons: 24, duration: "6 hrs", level: "Advanced" },
              { title: "Electrical Systems", lessons: 15, duration: "3 hrs", level: "Intermediate" },
              { title: "Brake Systems", lessons: 10, duration: "2 hrs", level: "Beginner" },
              { title: "Suspension Setup", lessons: 14, duration: "3.5 hrs", level: "Intermediate" },
            ].map((course, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg mb-4 flex items-center justify-center">
                    <Wrench className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span>{course.lessons} lessons</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={
                        course.level === "Beginner"
                          ? "text-green-600 border-green-200"
                          : course.level === "Intermediate"
                            ? "text-blue-600 border-blue-200"
                            : "text-purple-600 border-purple-200"
                      }
                    >
                      {course.level}
                    </Badge>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      Start
                    </Button>
                  </div>
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
