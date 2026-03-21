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
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-primary/15 via-background to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-semibold text-sm">{liveCount} Live Now</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Live Shopping Streams</h1>
              <p className="text-muted-foreground">Watch, shop, and interact with your favorite creators in real-time</p>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="bg-white dark:bg-card rounded-2xl px-6 py-4 border border-border shadow-sm">
                <p className="text-2xl font-bold text-primary">{totalViewers.toLocaleString()}</p>
                <p className="text-muted-foreground text-sm font-medium">Watching Now</p>
              </div>
              <div className="bg-white dark:bg-card rounded-2xl px-6 py-4 border border-border shadow-sm">
                <p className="text-2xl font-bold text-secondary">{MOCK_STREAMS.length}</p>
                <p className="text-muted-foreground text-sm font-medium">Active Streams</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Hosts */}
      <div className="bg-white dark:bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">Featured Hosts:</span>
            {FEATURED_HOSTS.map((host, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-muted rounded-full px-4 py-2 flex-shrink-0 hover:bg-muted/80 transition-colors cursor-pointer"
              >
                <img
                  src={host.avatar || "/placeholder.svg"}
                  alt={host.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">{host.name}</p>
                  <p className="text-xs text-muted-foreground">{host.followers} followers</p>
                </div>
                <Badge
                  className={
                    host.category === "beauty"
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "bg-secondary/20 text-secondary border-secondary/30"
                  }
                  variant="outline"
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary hover:bg-primary/90 text-white" : "border-border hover:bg-muted"}
            >
              All Streams
            </Button>
            <Button
              variant={filter === "beauty" ? "default" : "outline"}
              onClick={() => setFilter("beauty")}
              className={
                filter === "beauty"
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "border-border hover:bg-muted"
              }
            >
              <Sparkles className="w-4 h-4 mr-2" /> Beauty
            </Button>
            <Button
              variant={filter === "auto" ? "default" : "outline"}
              onClick={() => setFilter("auto")}
              className={
                filter === "auto" ? "bg-secondary hover:bg-secondary/90 text-white" : "border-border hover:bg-muted"
              }
            >
              <Wrench className="w-4 h-4 mr-2" /> Auto
            </Button>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search streams or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Stream Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStreams.map((stream) => (
            <Card
              key={stream.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 transform hover:scale-105"
            >
              <div className="relative">
                <img
                  src={stream.thumbnail || "/placeholder.svg"}
                  alt={stream.title}
                  className="w-full h-48 object-cover group-hover:brightness-90 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {stream.isLive && (
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="bg-red-500 text-white font-bold">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </Badge>
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Badge className="bg-black/70 backdrop-blur-sm text-white text-xs">
                    <Eye className="w-3 h-3 mr-1" /> {stream.viewers.toLocaleString()}
                  </Badge>
                  <Badge className="bg-black/70 backdrop-blur-sm text-white text-xs">
                    <ShoppingBag className="w-3 h-3 mr-1" /> {stream.products}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-foreground line-clamp-2 text-sm">{stream.title}</h3>
                  <Badge
                    className={
                      stream.category === "beauty"
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-secondary/20 text-secondary border-secondary/30"
                    }
                    variant="outline"
                  >
                    {stream.category === "beauty" ? <Sparkles className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-3">{stream.host}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-foreground">{stream.rating}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-border hover:bg-muted p-2"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className={
                        stream.category === "beauty"
                          ? "bg-primary hover:bg-primary/90 text-white"
                          : "bg-secondary hover:bg-secondary/90 text-white"
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
            <p className="text-muted-foreground font-medium">No streams found matching your criteria.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
