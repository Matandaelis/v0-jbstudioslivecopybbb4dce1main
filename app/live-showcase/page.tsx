"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Play, Eye, Heart, ShoppingBag, Search, Sparkles, Wrench, Star } from "lucide-react"

const MOCK_STREAMS = [
  {
    id: 1,
    host: "Sarah Kimani",
    title: "Evening Glow Makeup Tutorial",
    viewers: 1245,
    category: "beauty",
    thumbnail: "/beauty-makeup-tutorial-live-stream.jpg",
    isLive: true,
    products: 12,
    rating: 4.9,
  },
  {
    id: 2,
    host: "Mike Odhiambo",
    title: "BMW E46 Brake Installation",
    viewers: 892,
    category: "auto",
    thumbnail: "/auto-mechanic-car-repair-stream.jpg",
    isLive: true,
    products: 8,
    rating: 4.8,
  },
  {
    id: 3,
    host: "Grace Wanjiku",
    title: "Natural Hair Care Secrets",
    viewers: 2103,
    category: "beauty",
    thumbnail: "/natural-hair-care-tutorial.jpg",
    isLive: true,
    products: 15,
    rating: 4.9,
  },
  {
    id: 4,
    host: "James Mutua",
    title: "Toyota Hilux Engine Tune-up",
    viewers: 567,
    category: "auto",
    thumbnail: "/toyota-engine-repair-mechanic.jpg",
    isLive: true,
    products: 6,
    rating: 4.7,
  },
  {
    id: 5,
    host: "Faith Nyambura",
    title: "Skincare Routine for Oily Skin",
    viewers: 1890,
    category: "beauty",
    thumbnail: "/skincare-routine-beauty-tutorial.jpg",
    isLive: false,
    products: 10,
    rating: 4.8,
  },
  {
    id: 6,
    host: "Peter Kamau",
    title: "Subaru WRX Suspension Setup",
    viewers: 723,
    category: "auto",
    thumbnail: "/subaru-suspension-mechanic-stream.jpg",
    isLive: false,
    products: 9,
    rating: 4.6,
  },
]

const FEATURED_HOSTS = [
  { name: "Sarah K.", avatar: "/african-woman-beauty-influencer.jpg", followers: "25K", category: "beauty" },
  { name: "Mike O.", avatar: "/african-man-mechanic-professional.jpg", followers: "18K", category: "auto" },
  { name: "Grace W.", avatar: "/african-woman-hair-stylist.jpg", followers: "32K", category: "beauty" },
  { name: "James M.", avatar: "/african-man-auto-expert.jpg", followers: "15K", category: "auto" },
]

export default function LiveShowcase() {
  const [filter, setFilter] = useState<"all" | "beauty" | "auto">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStreams = MOCK_STREAMS.filter((stream) => {
    const matchesFilter = filter === "all" || stream.category === filter
    const matchesSearch =
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.host.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const liveCount = MOCK_STREAMS.filter((s) => s.isLive).length
  const totalViewers = MOCK_STREAMS.filter((s) => s.isLive).reduce((acc, s) => acc + s.viewers, 0)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-400 font-medium">{liveCount} Live Now</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Shopping Streams</h1>
              <p className="text-slate-400">Watch, shop, and interact with your favorite creators in real-time</p>
            </div>
            <div className="flex gap-6 text-center">
              <div className="bg-slate-800 rounded-xl px-6 py-4">
                <p className="text-2xl font-bold text-white">{totalViewers.toLocaleString()}</p>
                <p className="text-slate-400 text-sm">Watching Now</p>
              </div>
              <div className="bg-slate-800 rounded-xl px-6 py-4">
                <p className="text-2xl font-bold text-white">{MOCK_STREAMS.length}</p>
                <p className="text-slate-400 text-sm">Active Streams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Hosts */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-6 overflow-x-auto pb-2">
            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Featured Hosts:</span>
            {FEATURED_HOSTS.map((host, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-full px-4 py-2 flex-shrink-0">
                <img
                  src={host.avatar || "/placeholder.svg"}
                  alt={host.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-slate-900 text-sm">{host.name}</p>
                  <p className="text-xs text-slate-500">{host.followers} followers</p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    host.category === "beauty" ? "border-pink-300 text-pink-600" : "border-orange-300 text-orange-600"
                  }
                >
                  {host.category === "beauty" ? (
                    <Sparkles className="w-3 h-3 mr-1" />
                  ) : (
                    <Wrench className="w-3 h-3 mr-1" />
                  )}
                  {host.category}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-slate-900" : "bg-transparent"}
            >
              All Streams
            </Button>
            <Button
              variant={filter === "beauty" ? "default" : "outline"}
              onClick={() => setFilter("beauty")}
              className={filter === "beauty" ? "bg-pink-500 hover:bg-pink-600" : "bg-transparent"}
            >
              <Sparkles className="w-4 h-4 mr-2" /> Beauty
            </Button>
            <Button
              variant={filter === "auto" ? "default" : "outline"}
              onClick={() => setFilter("auto")}
              className={filter === "auto" ? "bg-orange-500 hover:bg-orange-600" : "bg-transparent"}
            >
              <Wrench className="w-4 h-4 mr-2" /> Auto
            </Button>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search streams or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Stream Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <Card key={stream.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <div className="relative">
                <img
                  src={stream.thumbnail || "/placeholder.svg"}
                  alt={stream.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {stream.isLive && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </Badge>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                  <Badge className="bg-black/70 text-white">
                    <Eye className="w-3 h-3 mr-1" /> {stream.viewers.toLocaleString()}
                  </Badge>
                  <Badge className="bg-black/70 text-white">
                    <ShoppingBag className="w-3 h-3 mr-1" /> {stream.products} products
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 line-clamp-1">{stream.title}</h3>
                  <Badge
                    variant="outline"
                    className={
                      stream.category === "beauty"
                        ? "border-pink-300 text-pink-600"
                        : "border-orange-300 text-orange-600"
                    }
                  >
                    {stream.category === "beauty" ? <Sparkles className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{stream.host}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{stream.rating}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="bg-transparent">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className={
                        stream.category === "beauty"
                          ? "bg-pink-500 hover:bg-pink-600"
                          : "bg-orange-500 hover:bg-orange-600"
                      }
                    >
                      <Play className="w-4 h-4 mr-1" /> Watch
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStreams.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500">No streams found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
