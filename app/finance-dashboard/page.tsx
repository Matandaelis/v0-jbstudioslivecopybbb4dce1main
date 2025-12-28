"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react"

export default function FinanceDashboardPage() {
  const [timeRange, setTimeRange] = useState("30d")

  const financialMetrics = [
    { label: "Total Revenue", value: "$125,430", change: "+12.5%", trend: "up", icon: DollarSign },
    { label: "Net Profit", value: "$48,290", change: "+8.3%", trend: "up", icon: TrendingUp },
    { label: "Expenses", value: "$77,140", change: "-3.2%", trend: "down", icon: CreditCard },
    { label: "Pending Payouts", value: "$12,850", change: "5 pending", trend: "neutral", icon: Wallet },
  ]

  const transactions = [
    { id: "TXN001", type: "Sale", amount: "+$1,250.00", status: "Completed", date: "Dec 3, 2025" },
    { id: "TXN002", type: "Payout", amount: "-$5,000.00", status: "Processing", date: "Dec 2, 2025" },
    { id: "TXN003", type: "Refund", amount: "-$89.99", status: "Completed", date: "Dec 1, 2025" },
    { id: "TXN004", type: "Sale", amount: "+$3,450.00", status: "Completed", date: "Dec 1, 2025" },
    { id: "TXN005", type: "Commission", amount: "+$425.50", status: "Completed", date: "Nov 30, 2025" },
  ]

  const revenueStreams = [
    { name: "Product Sales", amount: "$78,500", percentage: 62 },
    { name: "Commissions", amount: "$28,430", percentage: 23 },
    { name: "Subscriptions", amount: "$12,500", percentage: 10 },
    { name: "Tips & Gifts", amount: "$6,000", percentage: 5 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <h1 className="text-3xl font-bold">Finance Dashboard</h1>
            </div>
            <p className="text-muted-foreground">Track revenue, expenses, and financial performance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-lg p-1">
              {["7d", "30d", "90d", "1y"].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {financialMetrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                      {metric.trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-500" />}
                      <span
                        className={`text-sm ${metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <metric.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Chart Placeholder */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Revenue Overview
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Revenue chart visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-lg ${
                            txn.type === "Sale" || txn.type === "Commission"
                              ? "bg-green-500/10"
                              : txn.type === "Refund"
                                ? "bg-red-500/10"
                                : "bg-blue-500/10"
                          }`}
                        >
                          {txn.type === "Sale" || txn.type === "Commission" ? (
                            <ArrowUpRight
                              className={`h-4 w-4 ${txn.type === "Sale" || txn.type === "Commission" ? "text-green-500" : ""}`}
                            />
                          ) : (
                            <ArrowDownRight
                              className={`h-4 w-4 ${txn.type === "Refund" ? "text-red-500" : "text-blue-500"}`}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{txn.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {txn.id} - {txn.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${txn.amount.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                          {txn.amount}
                        </p>
                        <Badge variant={txn.status === "Completed" ? "secondary" : "outline"} className="text-xs">
                          {txn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-500" />
                  Revenue Streams
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {revenueStreams.map((stream) => (
                  <div key={stream.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{stream.name}</span>
                      <span className="font-medium">{stream.amount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                        style={{ width: `${stream.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{stream.percentage}% of total</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Wallet className="h-4 w-4 mr-2" />
                  Request Payout
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Reports
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Tax Documents
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Payouts */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Wallet className="h-10 w-10 mx-auto text-green-500 mb-3" />
                  <h3 className="font-bold text-lg">Next Payout</h3>
                  <p className="text-2xl font-bold text-green-500 my-2">$8,450.00</p>
                  <p className="text-sm text-muted-foreground">Scheduled for Dec 15, 2025</p>
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
