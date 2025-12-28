"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  HelpCircle,
  Search,
  Book,
  Video,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
  FileText,
  Users,
  DollarSign,
  Settings,
  Play,
  ShoppingBag,
} from "lucide-react"

const FAQ_CATEGORIES = [
  { name: "Getting Started", icon: <Play className="w-5 h-5" />, count: 12 },
  { name: "Streaming", icon: <Video className="w-5 h-5" />, count: 18 },
  { name: "Payments", icon: <DollarSign className="w-5 h-5" />, count: 15 },
  { name: "Products", icon: <ShoppingBag className="w-5 h-5" />, count: 10 },
  { name: "Account", icon: <Settings className="w-5 h-5" />, count: 8 },
  { name: "Affiliate", icon: <Users className="w-5 h-5" />, count: 14 },
]

const POPULAR_ARTICLES = [
  { title: "How to start your first live stream", views: 12500 },
  { title: "Understanding commission tiers", views: 8900 },
  { title: "Setting up M-Pesa payments", views: 7600 },
  { title: "Tips for increasing viewer engagement", views: 6200 },
  { title: "How to add products to your stream", views: 5400 },
]

const RECENT_TICKETS = [
  { id: "TKT-001", subject: "Payment not received", status: "open", date: "2 hours ago" },
  { id: "TKT-002", subject: "Stream quality issues", status: "resolved", date: "1 day ago" },
]

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">Search our knowledge base or browse categories below</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white text-slate-900 border-0"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Browse by Category</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FAQ_CATEGORIES.map((category, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{category.name}</h3>
                        <p className="text-sm text-slate-500">{category.count} articles</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Popular Articles */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="w-5 h-5" /> Popular Articles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {POPULAR_ARTICLES.map((article, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-slate-900">{article.title}</span>
                      </div>
                      <span className="text-sm text-slate-500">{(article.views / 1000).toFixed(1)}K views</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Video Tutorials */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" /> Video Tutorials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { title: "Getting Started Guide", duration: "5:30" },
                    { title: "Stream Setup Tutorial", duration: "8:45" },
                    { title: "Product Upload Walkthrough", duration: "4:15" },
                    { title: "Earnings Dashboard Overview", duration: "6:20" },
                  ].map((video, idx) => (
                    <div key={idx} className="group cursor-pointer">
                      <div className="aspect-video bg-slate-900 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden">
                        <Play className="w-12 h-12 text-white/50 group-hover:text-white transition-colors" />
                        <Badge className="absolute bottom-2 right-2 bg-black/70">{video.duration}</Badge>
                      </div>
                      <p className="font-medium text-slate-900 text-sm">{video.title}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="w-4 h-4 mr-3" /> Live Chat
                  <Badge className="ml-auto bg-green-100 text-green-700">Online</Badge>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Mail className="w-4 h-4 mr-3" /> Email Support
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Phone className="w-4 h-4 mr-3" /> Call Us
                </Button>
              </CardContent>
            </Card>

            {/* My Tickets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">My Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {RECENT_TICKETS.map((ticket, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900 text-sm">{ticket.subject}</span>
                      <Badge
                        variant="outline"
                        className={
                          ticket.status === "open"
                            ? "text-yellow-600 border-yellow-200"
                            : "text-green-600 border-green-200"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {ticket.id} • {ticket.date}
                    </p>
                  </div>
                ))}
                <Button className="w-full bg-blue-500 hover:bg-blue-600">
                  <MessageSquare className="w-4 h-4 mr-2" /> Submit New Ticket
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-5">
                <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {["Community Guidelines", "Terms of Service", "Privacy Policy", "Commission Structure"].map(
                    (link, idx) => (
                      <a key={idx} href="#" className="block text-sm text-blue-600 hover:text-blue-700">
                        {link}
                      </a>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
