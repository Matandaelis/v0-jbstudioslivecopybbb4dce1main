"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Eye,
  Clock,
  TrendingUp,
  XCircle,
  Settings,
  Search,
  Filter,
} from "lucide-react"

const COMPLIANCE_STATS = {
  totalReviews: 456,
  pending: 23,
  approved: 412,
  flagged: 21,
  avgReviewTime: "2.5 hrs",
}

const PENDING_REVIEWS = [
  { id: 1, type: "Stream Content", host: "Sarah K.", submitted: "2 hours ago", priority: "high" },
  { id: 2, type: "Product Listing", host: "Grace W.", submitted: "3 hours ago", priority: "medium" },
  { id: 3, type: "Profile Update", host: "Mike O.", submitted: "4 hours ago", priority: "low" },
  { id: 4, type: "Promotional Content", host: "Faith N.", submitted: "5 hours ago", priority: "high" },
]

const FLAGGED_CONTENT = [
  { id: 1, content: "Inappropriate language detected", host: "Anonymous", time: "1 hour ago", status: "under-review" },
  { id: 2, content: "Misleading product claims", host: "James M.", time: "3 hours ago", status: "under-review" },
  { id: 3, content: "Copyright violation", host: "Peter K.", time: "6 hours ago", status: "resolved" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "pending" | "flagged" | "settings">("overview")

  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="min-h-screen bg-slate-50">
        <Navigation />

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">Compliance Dashboard</h1>
                </div>
                <p className="text-white/80">Content moderation and compliance management</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                  <FileText className="w-4 h-4 mr-2" /> Reports
                </Button>
                <Button className="bg-white text-slate-900 hover:bg-slate-100">
                  <Settings className="w-4 h-4 mr-2" /> Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-6 -mt-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: "Total Reviews",
                value: COMPLIANCE_STATS.totalReviews,
                icon: <Eye className="w-5 h-5" />,
                color: "bg-blue-100 text-blue-600",
              },
              {
                label: "Pending",
                value: COMPLIANCE_STATS.pending,
                icon: <Clock className="w-5 h-5" />,
                color: "bg-yellow-100 text-yellow-600",
              },
              {
                label: "Approved",
                value: COMPLIANCE_STATS.approved,
                icon: <CheckCircle className="w-5 h-5" />,
                color: "bg-green-100 text-green-600",
              },
              {
                label: "Flagged",
                value: COMPLIANCE_STATS.flagged,
                icon: <AlertTriangle className="w-5 h-5" />,
                color: "bg-red-100 text-red-600",
              },
              {
                label: "Avg Time",
                value: COMPLIANCE_STATS.avgReviewTime,
                icon: <TrendingUp className="w-5 h-5" />,
                color: "bg-purple-100 text-purple-600",
              },
            ].map((stat, idx) => (
              <Card key={idx} className="bg-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-2">
            {[
              { key: "overview", label: "Overview" },
              { key: "pending", label: "Pending Reviews", count: COMPLIANCE_STATS.pending },
              { key: "flagged", label: "Flagged Content", count: COMPLIANCE_STATS.flagged },
              { key: "settings", label: "Settings" },
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={activeTab === tab.key ? "bg-slate-900" : "bg-transparent"}
              >
                {tab.label}
                {tab.count && <Badge className="ml-2 bg-red-500 text-white">{tab.count}</Badge>}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {PENDING_REVIEWS.map((review) => (
                      <div key={review.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{review.type}</p>
                          <p className="text-sm text-slate-500">
                            {review.host} • {review.submitted}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              review.priority === "high"
                                ? "text-red-600 border-red-200"
                                : review.priority === "medium"
                                  ? "text-yellow-600 border-yellow-200"
                                  : "text-green-600 border-green-200"
                            }
                          >
                            {review.priority}
                          </Badge>
                          <Button size="sm" variant="outline" className="bg-transparent">
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Flagged Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {FLAGGED_CONTENT.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium text-slate-900">{item.content}</p>
                            <p className="text-sm text-slate-500">
                              {item.host} • {item.time}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            item.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "pending" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pending Reviews</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Filter className="w-4 h-4 mr-2" /> Filter
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Search className="w-4 h-4 mr-2" /> Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {PENDING_REVIEWS.map((review) => (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            review.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : review.priority === "medium"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-green-100 text-green-600"
                          }`}
                        >
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{review.type}</h4>
                          <p className="text-sm text-slate-500">
                            Submitted by {review.host} • {review.submitted}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            review.priority === "high"
                              ? "text-red-600 border-red-200 bg-red-50"
                              : review.priority === "medium"
                                ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                                : "text-green-600 border-green-200 bg-green-50"
                          }
                        >
                          {review.priority} priority
                        </Badge>
                        <Button variant="outline" size="sm" className="bg-transparent text-red-500">
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "flagged" && (
            <Card>
              <CardHeader>
                <CardTitle>Flagged Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {FLAGGED_CONTENT.map((item) => (
                    <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-6 h-6 text-red-500" />
                          <h4 className="font-semibold text-slate-900">{item.content}</h4>
                        </div>
                        <Badge
                          className={
                            item.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">Reported by system • {item.time}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="bg-white">
                          View Content
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white text-red-500">
                          Take Action
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          Mark Resolved
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Compliance Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "Auto-Moderation", desc: "Automatically flag content with prohibited keywords" },
                  { title: "Review Notifications", desc: "Get notified when new content needs review" },
                  { title: "Escalation Rules", desc: "Configure when to escalate flagged content" },
                  { title: "Compliance Reports", desc: "Weekly compliance report generation" },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-slate-900">{setting.title}</h4>
                      <p className="text-sm text-slate-500">{setting.desc}</p>
                    </div>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Configure
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
