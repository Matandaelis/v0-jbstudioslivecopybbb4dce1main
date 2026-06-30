"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import {
  Play,
  Zap,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Clock,
  ShoppingBag,
  Sparkles,
  Flame,
  ChevronRight,
  Eye,
} from "lucide-react"

interface CountdownTimer {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const LIVE_STREAMS = [
  {
    id: 1,
    title: "Spring Makeup Collection Launch",
    host: "Beauty Creator",
    viewers: 2400,
    thumbnail: "/placeholder.svg",
    status: "live" as const,
    products: 12,
    discount: 30,
  },
  {
    id: 2,
    title: "Limited Edition Fashion Show",
    host: "Style Maven",
    viewers: 1800,
    thumbnail: "/placeholder.svg",
    status: "live" as const,
    products: 8,
    discount: 25,
  },
  {
    id: 3,
    title: "Tech Gadgets Mega Sale",
    host: "Tech Expert",
    viewers: 3200,
    thumbnail: "/placeholder.svg",
    status: "live" as const,
    products: 15,
    discount: 40,
  },
]

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Luxury Skincare Collection",
    host: "Skincare Pro",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    image: "/placeholder.svg",
  },
  {
    id: 2,
    title: "Designer Handbag Showcase",
    host: "Fashion Icon",
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
    image: "/placeholder.svg",
  },
  {
    id: 3,
    title: "Home Decor Exclusive",
    host: "Interior Designer",
    startTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
    image: "/placeholder.svg",
  },
]

const CATEGORIES = [
  { name: "Beauty", icon: Sparkles, color: "from-pink-500 to-rose-500" },
  { name: "Fashion", icon: Zap, color: "from-purple-500 to-pink-500" },
  { name: "Home & Living", icon: Play, color: "from-blue-500 to-cyan-500" },
  { name: "Tech & Gadgets", icon: TrendingUp, color: "from-orange-500 to-red-500" },
]

export default function HomePage() {
  const [countdowns, setCountdowns] = useState<Record<number, CountdownTimer>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<number, CountdownTimer> = {}
      UPCOMING_EVENTS.forEach((event) => {
        const diff = event.startTime.getTime() - Date.now()
        newCountdowns[event.id] = {
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        }
      })
      setCountdowns(newCountdowns)
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-secondary/10 pt-16 md:pt-20 pb-12 md:pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float-up" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float-up" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="w-fit bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                  <Zap className="w-3 h-3 mr-2" />
                  Join the Live Shopping Revolution
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Shop Live,
                  <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Shop Together
                  </span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Experience the future of shopping. Watch live demonstrations, chat with creators, and shop real-time deals with thousands of engaged viewers.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/live-showcase">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold shadow-lg hover:shadow-xl">
                    <Play className="w-5 h-5 mr-2" />
                    Start Shopping Live
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-border hover:bg-muted">
                  <Heart className="w-5 h-5 mr-2" />
                  Explore Collections
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">50K+</p>
                  <p className="text-sm text-muted-foreground">Active Shoppers</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-secondary">500+</p>
                  <p className="text-sm text-muted-foreground">Live Events</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-primary">$5M+</p>
                  <p className="text-sm text-muted-foreground">Sales Volume</p>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative h-96 md:h-full lg:min-h-[500px] animate-slide-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl" />
              <img
                src="/live-shopping-hero.jpg"
                alt="Live Shopping Experience"
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />

              {/* Live Badge */}
              <div className="absolute top-6 left-6 animate-pulse-ring">
                <Badge className="bg-red-500 text-white font-bold text-sm">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  LIVE
                </Badge>
              </div>

              {/* Viewer Count Card */}
              <div className="absolute bottom-6 right-6 bg-white dark:bg-card backdrop-blur-md bg-opacity-95 rounded-2xl p-4 shadow-xl">
                <p className="text-sm text-muted-foreground mb-1">Watching Now</p>
                <p className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  12.4K
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Now Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Streaming Now</h2>
              <p className="text-muted-foreground">Check out these live sessions and exclusive deals</p>
            </div>
            <Link href="/live-showcase">
              <Button variant="outline" className="gap-2 border-border">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LIVE_STREAMS.map((stream) => (
              <Card
                key={stream.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 transform hover:scale-105"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Live Badge */}
                  {stream.status === "live" && (
                    <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                      </span>
                      LIVE
                    </Badge>
                  )}

                  {/* Discount Badge */}
                  <Badge className="absolute top-3 right-3 bg-secondary text-white font-bold text-lg">
                    -{stream.discount}%
                  </Badge>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge variant="secondary" className="bg-black/70 text-white">
                      <Users className="w-3 h-3 mr-1" /> {stream.viewers.toLocaleString()} watching
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-bold text-foreground mb-1 line-clamp-2">{stream.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{stream.host}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      <ShoppingBag className="w-3 h-3 mr-1" /> {stream.products} Products
                    </Badge>
                    <Link href={`/live/${stream.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 text-white">
                        <Play className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore curated collections across all your favorite categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.name
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(isSelected ? null : category.name)}
                  className={`p-6 rounded-2xl transition-all duration-300 group cursor-pointer border-2 ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary bg-white dark:bg-card hover:shadow-lg"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground text-left">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 text-left">Explore now</p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Countdown Section - Upcoming Events */}
      <section className="py-16 md:py-24 bg-white dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Get ready for the next exclusive streams</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {UPCOMING_EVENTS.map((event) => {
              const timer = countdowns[event.id]
              return (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 hover:border-primary/20"
                >
                  <div className="relative h-40 overflow-hidden bg-muted">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Countdown Timer Badge */}
                    {timer && (
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                        <p className="text-xs text-white/70 font-medium mb-1">Starts In</p>
                        <div className="flex gap-2 text-white text-xs font-bold">
                          {timer.days > 0 && <span>{timer.days}d</span>}
                          <span>{String(timer.hours).padStart(2, "0")}h</span>
                          <span>{String(timer.minutes).padStart(2, "0")}m</span>
                          <span>{String(timer.seconds).padStart(2, "0")}s</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{event.host}</p>

                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold gap-2">
                      <Clock className="w-4 h-4" />
                      Set Reminder
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Live Chat Preview Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-transparent to-secondary/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Real-Time Interaction
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Chat live with creators and fellow shoppers, share reactions, and stay engaged throughout the stream. Join an active community of enthusiastic shoppers.
              </p>

              <div className="space-y-3">
                {[
                  "Live chat with real-time updates",
                  "Express reactions with emoji buttons",
                  "View trending reactions",
                  "Connect with other viewers",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-foreground font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href="/live-shopping">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold gap-2">
                  Join a Live Stream
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Chat Preview */}
            <Card className="border-0 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 border-b border-border">
                <p className="font-bold text-foreground">Live Chat - Beauty Haul</p>
                <p className="text-xs text-muted-foreground">3,421 viewers</p>
              </div>

              <CardContent className="p-4 space-y-3 max-h-96 overflow-y-auto bg-background/50">
                {[
                  { user: "Sarah M.", message: "This palette is GORGEOUS! 😍", badge: "viewer" },
                  { user: "Creator", message: "Thanks! It's my personal fave! Get 20% off with code LIVE20", badge: "host" },
                  { user: "Mike L.", message: "Just ordered 🛍️", badge: "viewer" },
                  { user: "Emma T.", message: "How long does it last? 💄", badge: "viewer" },
                ].map((msg, idx) => (
                  <div key={idx} className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{msg.user}</span>
                      {msg.badge === "host" && (
                        <Badge className="text-xs bg-secondary/20 text-secondary border-secondary/30">
                          Host
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground/80">{msg.message}</p>
                  </div>
                ))}
              </CardContent>

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground">
                    Type a message...
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust & Social Proof */}
      <section className="py-16 md:py-20 bg-white dark:bg-black/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Trusted by Thousands</h2>
            <p className="text-muted-foreground">Join our growing community of smart shoppers</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Users", value: "50K+" },
              { label: "Live Events", value: "500+" },
              { label: "Products Sold", value: "100K+" },
              { label: "Avg. Savings", value: "$85" },
            ].map((stat, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border hover:border-primary/30 transition-colors">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            Start Shopping Live Today
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the excitement of live shopping with exclusive deals, real-time interactions, and a community of passionate shoppers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/live-showcase">
              <Button size="lg" className="bg-white dark:bg-foreground text-primary hover:bg-white/90 font-bold shadow-lg hover:shadow-xl px-8">
                <Play className="w-5 h-5 mr-2" />
                Browse Live Streams
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
