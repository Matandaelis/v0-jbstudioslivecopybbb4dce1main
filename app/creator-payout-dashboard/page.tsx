"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Download,
  Calendar,
  CreditCard,
  Building2,
  Smartphone,
  Sparkles,
  Wrench,
} from "lucide-react"

const PAYOUT_HISTORY = [
  { id: 1, date: "Dec 10, 2024", amount: 45000, method: "M-Pesa", status: "completed", ref: "PAY-2024-001" },
  { id: 2, date: "Dec 03, 2024", amount: 38000, method: "Bank", status: "completed", ref: "PAY-2024-002" },
  { id: 3, date: "Nov 26, 2024", amount: 52000, method: "M-Pesa", status: "completed", ref: "PAY-2024-003" },
  { id: 4, date: "Nov 19, 2024", amount: 41000, method: "M-Pesa", status: "completed", ref: "PAY-2024-004" },
  { id: 5, date: "Nov 12, 2024", amount: 35000, method: "Bank", status: "completed", ref: "PAY-2024-005" },
]

const EARNINGS_BREAKDOWN = [
  { source: "Stream Sales", amount: 125000, percentage: 65 },
  { source: "Affiliate Commissions", amount: 45000, percentage: 23 },
  { source: "Tips & Gifts", amount: 18000, percentage: 9 },
  { source: "Bonuses", amount: 6000, percentage: 3 },
]

export default function CreatorPayoutDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [vertical, setVertical] = useState<"beauty" | "auto">("beauty")
  const isBeauty = vertical === "beauty"

  const totalEarnings = 194000
  const pendingPayout = 32500
  const nextPayoutDate = "Dec 17, 2024"

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
              <h1 className="text-2xl md:text-3xl font-bold">Payouts & Earnings</h1>
              <p className="text-white/80 mt-1">Track your earnings and manage payouts</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-slate-100">
                <DollarSign className="w-4 h-4 mr-2" /> Request Payout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Earnings",
              value: `KES ${totalEarnings.toLocaleString()}`,
              icon: <DollarSign className="w-5 h-5" />,
              change: "+18%",
            },
            {
              label: "Pending Payout",
              value: `KES ${pendingPayout.toLocaleString()}`,
              icon: <Clock className="w-5 h-5" />,
              change: null,
            },
            { label: "This Month", value: "KES 89,000", icon: <TrendingUp className="w-5 h-5" />, change: "+12%" },
            { label: "Next Payout", value: nextPayoutDate, icon: <Calendar className="w-5 h-5" />, change: null },
          ].map((stat, idx) => (
            <Card key={idx} className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${isBeauty ? "bg-pink-100 text-pink-600" : "bg-orange-100 text-orange-600"}`}
                  >
                    {stat.icon}
                  </div>
                  {stat.change && (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payout History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Payout History</CardTitle>
                <div className="flex gap-2">
                  {["week", "month", "year"].map((range) => (
                    <Button
                      key={range}
                      variant={timeRange === range ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeRange(range as typeof timeRange)}
                      className={timeRange === range ? (isBeauty ? "bg-pink-500" : "bg-orange-500") : "bg-transparent"}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {PAYOUT_HISTORY.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            payout.method === "M-Pesa" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {payout.method === "M-Pesa" ? (
                            <Smartphone className="w-5 h-5" />
                          ) : (
                            <Building2 className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">KES {payout.amount.toLocaleString()}</p>
                          <p className="text-sm text-slate-500">
                            {payout.date} • {payout.ref}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" /> {payout.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {EARNINGS_BREAKDOWN.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.source}</span>
                      <span className="font-medium">KES {item.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isBeauty ? "bg-pink-500" : "bg-orange-500"}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    icon: <Smartphone className="w-5 h-5" />,
                    name: "M-Pesa",
                    detail: "+254 7** *** ***",
                    primary: true,
                  },
                  {
                    icon: <Building2 className="w-5 h-5" />,
                    name: "Bank Transfer",
                    detail: "KCB ****1234",
                    primary: false,
                  },
                ].map((method, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${method.primary ? "bg-green-50 border border-green-200" : "bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${method.primary ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-600"}`}
                      >
                        {method.icon}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{method.name}</p>
                        <p className="text-xs text-slate-500">{method.detail}</p>
                      </div>
                    </div>
                    {method.primary && <Badge className="bg-green-500 text-xs">Primary</Badge>}
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  <CreditCard className="w-4 h-4 mr-2" /> Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card className={`${isBeauty ? "bg-pink-50 border-pink-200" : "bg-orange-50 border-orange-200"}`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className={`w-5 h-5 ${isBeauty ? "text-pink-600" : "text-orange-600"}`} />
                  <h3 className="font-semibold text-slate-900">Pending Payout</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">KES {pendingPayout.toLocaleString()}</p>
                <p className="text-sm text-slate-600 mb-4">Will be processed on {nextPayoutDate}</p>
                <Button
                  className={`w-full ${isBeauty ? "bg-pink-500 hover:bg-pink-600" : "bg-orange-500 hover:bg-orange-600"}`}
                >
                  Request Early Payout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
