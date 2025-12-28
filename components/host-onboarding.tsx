"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Play,
  DollarSign,
  Award,
  ArrowRight,
  Check,
  Sparkles,
  Wrench,
  Star,
  Home,
  HelpCircle,
  Circle,
  Medal,
  Trophy,
  Gem,
  Diamond,
} from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

const COMMISSION_TIERS = [
  {
    id: "bronze",
    name: "Bronze",
    commissionLabel: "5%-8%",
    icon: Circle,
    color: "text-amber-700",
  },
  {
    id: "silver",
    name: "Silver",
    commissionLabel: "8%-12%",
    icon: Circle,
    color: "text-gray-400",
  },
  {
    id: "gold",
    name: "Gold",
    commissionLabel: "12%-15%",
    icon: Medal,
    color: "text-yellow-500",
  },
  {
    id: "platinum",
    name: "Platinum",
    commissionLabel: "15%-18%",
    icon: Trophy,
    color: "text-gray-500",
  },
  {
    id: "quartz",
    name: "Quartz",
    commissionLabel: "18%-22%",
    icon: Gem,
    color: "text-purple-500",
  },
  {
    id: "diamond",
    name: "Diamond",
    commissionLabel: "22%-25%",
    icon: Diamond,
    color: "text-cyan-500",
  },
]

export default function HostOnboarding() {
  const [vertical, setVertical] = useState("beauty")
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    tiktok_url: "",
    instagram_url: "",
    youtube_channel: "",
    location: "",
    country: "KE",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isBeauty = vertical === "beauty"

  const benefits = [
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Earn 15-25% Commission",
      desc: "On every sale you drive during streams",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Tier Progression",
      desc: "Ruby → Sapphire → Gold → Platinum → Diamond",
    },
    { icon: <Users className="w-6 h-6" />, title: "Build Your Team", desc: "Earn from your affiliate network" },
    { icon: <Play className="w-6 h-6" />, title: "Professional Tools", desc: "AI co-host, analytics, monetization" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSubmitted(true)
    setIsSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center p-6 min-h-[80vh]">
          <Card className="max-w-md w-full text-center">
            <CardContent className="pt-8 pb-6">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isBeauty ? "bg-pink-100" : "bg-orange-100"}`}
              >
                <Check className={`w-8 h-8 ${isBeauty ? "text-pink-600" : "text-orange-600"}`} />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;ll review your application and get back to you within 24-48 hours.
              </p>
              <div className="space-y-3">
                <Link href="/">
                  <Button className="w-full">Return Home</Button>
                </Link>
                <Link href="/host-training">
                  <Button variant="outline" className="w-full bg-transparent">
                    Start Training While You Wait
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header with African Pattern */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        {/* African geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="africanPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="20" cy="20" r="8" fill="none" stroke="white" strokeWidth="1" />
                <circle cx="20" cy="20" r="3" fill="white" />
              </pattern>
            </defs>
            <rect fill="url(#africanPattern)" width="200" height="200" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <Home className="w-4 h-4 mr-2" /> Home
              </Button>
            </Link>
            <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
              <Button
                size="sm"
                onClick={() => setVertical("beauty")}
                className={
                  vertical === "beauty"
                    ? "bg-pink-500 text-white"
                    : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-700"
                }
              >
                <Sparkles className="w-4 h-4 mr-1" /> Beauty
              </Button>
              <Button
                size="sm"
                onClick={() => setVertical("auto")}
                className={
                  vertical === "auto"
                    ? "bg-orange-500 text-white"
                    : "bg-transparent text-slate-400 hover:text-white hover:bg-slate-700"
                }
              >
                <Wrench className="w-4 h-4 mr-1" /> Auto
              </Button>
            </div>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          {/* Decorative circles */}
          <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="55" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
              <circle cx="60" cy="60" r="40" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
              <circle cx="60" cy="60" r="25" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
            </svg>
          </div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="55" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
              <circle cx="60" cy="60" r="40" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
              <circle cx="60" cy="60" r="25" fill="none" stroke={isBeauty ? "#ec4899" : "#f97316"} strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">🇰🇪</span>
            <span className="text-2xl">🇹🇿</span>
            <span className="text-2xl">🇺🇬</span>
          </div>
          <Badge className="mb-6 bg-white/10 text-white border-white/20 text-sm px-4 py-1">
            {isBeauty ? "GlowLive Host Program" : "GearLive Mechanic Program"}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Become a {isBeauty ? "Beauty Creator" : "Gear Expert"}
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            {isBeauty
              ? "Host live beauty streams and earn up to 25% commission on every sale."
              : "Stream auto installations and earn from your expertise."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Benefits */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBeauty ? "bg-pink-100" : "bg-orange-100"}`}
              >
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Why Join Us?</h2>
            </div>
            <div className="space-y-4">
              {benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{benefit.title}</h3>
                    <p className="text-slate-600 mt-1">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tier Progression */}
            <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>🏆</span> Commission Tiers
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {COMMISSION_TIERS.map((tier, idx) => {
                  const IconComponent = tier.icon
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200 text-center hover:border-slate-300 transition-colors"
                    >
                      <div className={`${tier.color} mb-2 flex justify-center`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-xs text-slate-900">{tier.name}</p>
                      <p className={`text-xs font-bold mt-1 ${isBeauty ? "text-pink-600" : "text-orange-600"}`}>
                        {tier.commissionLabel}
                      </p>
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">🌍 Earn across Kenya, Tanzania & Uganda</p>
            </div>
          </div>

          {/* Application Form */}
          <div>
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Apply Now</CardTitle>
                <p className="text-slate-500 text-sm">Takes less than 2 minutes</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Full Name *</label>
                      <Input
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Your name"
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-2">Phone *</label>
                      <Input
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+254..."
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Email *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Location *</label>
                    <Input
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="City, Country"
                      className="h-12"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-5">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Social Media (at least one)</p>
                    <div className="space-y-3">
                      <Input
                        value={formData.tiktok_url}
                        onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })}
                        placeholder="TikTok URL"
                        className="h-12"
                      />
                      <Input
                        value={formData.instagram_url}
                        onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                        placeholder="Instagram URL"
                        className="h-12"
                      />
                      <Input
                        value={formData.youtube_channel}
                        onChange={(e) => setFormData({ ...formData, youtube_channel: e.target.value })}
                        placeholder="YouTube Channel URL"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-14 text-base font-semibold ${isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-slate-400 text-center">
                    By applying, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="mt-6 flex gap-3">
              <Link href="/host-training" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-slate-300 bg-transparent">
                  <Star className="w-4 h-4 mr-2" /> View Training
                </Button>
              </Link>
              <Link href="/help-center" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-slate-300 bg-transparent">
                  <HelpCircle className="w-4 h-4 mr-2" /> Get Help
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
