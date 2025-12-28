"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Target,
  Brain,
  Layers,
  Settings,
  Sliders,
  Eye,
  ShoppingCart,
  Heart,
  TrendingUp,
  RefreshCw,
} from "lucide-react"

export default function PersonalizationCenterPage() {
  const [activeSegment, setActiveSegment] = useState("all")

  const segments = [
    { name: "High-Value Shoppers", count: 2450, conversion: "8.5%", color: "bg-purple-500" },
    { name: "Frequent Browsers", count: 8930, conversion: "3.2%", color: "bg-blue-500" },
    { name: "New Visitors", count: 12400, conversion: "1.8%", color: "bg-green-500" },
    { name: "At-Risk Churners", count: 890, conversion: "0.5%", color: "bg-red-500" },
  ]

  const personalizationRules = [
    { name: "Product Recommendations", status: "active", lift: "+24%", type: "AI-Powered" },
    { name: "Dynamic Pricing", status: "active", lift: "+12%", type: "Rule-Based" },
    { name: "Content Personalization", status: "active", lift: "+18%", type: "AI-Powered" },
    { name: "Email Subject Lines", status: "testing", lift: "+8%", type: "A/B Test" },
    { name: "Homepage Banner", status: "active", lift: "+15%", type: "Segment-Based" },
  ]

  const metrics = [
    { label: "Personalization Score", value: "87%", trend: "+5%", icon: Sparkles },
    { label: "Conversion Lift", value: "+24%", trend: "+3%", icon: TrendingUp },
    { label: "User Segments", value: "12", trend: "+2", icon: Layers },
    { label: "Active Experiments", value: "8", trend: "3 winning", icon: Brain },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <h1 className="text-3xl font-bold">Personalization Center</h1>
            </div>
            <p className="text-muted-foreground">Deliver tailored experiences to every user</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Sliders className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <p className="text-xs text-green-500 mt-1">{metric.trend}</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <metric.icon className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Segments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-500" />
                  User Segments
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {segments.map((segment) => (
                    <div
                      key={segment.name}
                      className="p-4 border rounded-lg hover:border-purple-500 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                        <Badge variant="secondary">{segment.conversion} CVR</Badge>
                      </div>
                      <h4 className="font-medium">{segment.name}</h4>
                      <p className="text-2xl font-bold mt-1">{segment.count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">users in segment</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Personalization Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  Active Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {personalizationRules.map((rule) => (
                  <div key={rule.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          rule.status === "active" ? "bg-green-500/10" : "bg-yellow-500/10"
                        }`}
                      >
                        <Target
                          className={`h-5 w-5 ${rule.status === "active" ? "text-green-500" : "text-yellow-500"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-xs text-muted-foreground">{rule.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-green-500">{rule.lift}</p>
                        <p className="text-xs text-muted-foreground">conversion lift</p>
                      </div>
                      <Badge variant={rule.status === "active" ? "default" : "secondary"}>{rule.status}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { action: "Product viewed", user: "User #4521", time: "Just now", icon: Eye },
                  { action: "Added to cart", user: "User #3892", time: "30s ago", icon: ShoppingCart },
                  { action: "Wishlist add", user: "User #7234", time: "1m ago", icon: Heart },
                  { action: "Product viewed", user: "User #1098", time: "2m ago", icon: Eye },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <activity.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="pt-6">
                <Brain className="h-10 w-10 text-purple-500 mb-4" />
                <h3 className="font-bold mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on recent data, we recommend increasing personalization for the "High-Value Shoppers" segment.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  View Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Recommendation Click Rate</span>
                    <span className="font-medium">12.4%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "62%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Personalization Coverage</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Model Accuracy</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
