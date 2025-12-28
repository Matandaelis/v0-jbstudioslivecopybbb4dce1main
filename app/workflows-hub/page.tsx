"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Workflow,
  Play,
  Pause,
  Settings,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  GitBranch,
  ArrowRight,
  MoreVertical,
  RefreshCw,
} from "lucide-react"

export default function WorkflowsHubPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const workflows = [
    {
      name: "New Customer Welcome",
      status: "active",
      runs: 1250,
      lastRun: "5 min ago",
      trigger: "User signup",
      steps: 5,
    },
    {
      name: "Order Fulfillment",
      status: "active",
      runs: 8430,
      lastRun: "2 min ago",
      trigger: "New order",
      steps: 8,
    },
    {
      name: "Affiliate Payout",
      status: "paused",
      runs: 342,
      lastRun: "1 day ago",
      trigger: "Monthly schedule",
      steps: 4,
    },
    {
      name: "Review Request",
      status: "active",
      runs: 2156,
      lastRun: "15 min ago",
      trigger: "Order delivered",
      steps: 3,
    },
    {
      name: "Abandoned Cart Recovery",
      status: "active",
      runs: 567,
      lastRun: "1 hour ago",
      trigger: "Cart abandoned",
      steps: 6,
    },
    {
      name: "Host Performance Alert",
      status: "error",
      runs: 89,
      lastRun: "3 hours ago",
      trigger: "Performance drop",
      steps: 4,
    },
  ]

  const stats = [
    { label: "Active Workflows", value: "12", icon: Play, color: "text-green-500" },
    { label: "Total Runs Today", value: "3,482", icon: RefreshCw, color: "text-blue-500" },
    { label: "Success Rate", value: "99.2%", icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Failed Runs", value: "28", icon: AlertCircle, color: "text-red-500" },
  ]

  const templates = [
    { name: "Email Sequence", category: "Marketing" },
    { name: "Lead Scoring", category: "Sales" },
    { name: "Support Ticket", category: "Support" },
    { name: "Inventory Alert", category: "Operations" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Workflow className="h-6 w-6 text-indigo-500" />
              </div>
              <h1 className="text-3xl font-bold">Workflows Hub</h1>
            </div>
            <p className="text-muted-foreground">Automate your business processes with powerful workflows</p>
          </div>
          <Button className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Workflows List */}
            <Card>
              <CardHeader>
                <CardTitle>All Workflows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.name}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          workflow.status === "active"
                            ? "bg-green-500/10"
                            : workflow.status === "paused"
                              ? "bg-yellow-500/10"
                              : "bg-red-500/10"
                        }`}
                      >
                        <GitBranch
                          className={`h-5 w-5 ${
                            workflow.status === "active"
                              ? "text-green-500"
                              : workflow.status === "paused"
                                ? "text-yellow-500"
                                : "text-red-500"
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {workflow.trigger}
                          </span>
                          <span>{workflow.steps} steps</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{workflow.runs.toLocaleString()} runs</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {workflow.lastRun}
                        </p>
                      </div>
                      <Badge
                        variant={
                          workflow.status === "active"
                            ? "default"
                            : workflow.status === "paused"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {workflow.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        {workflow.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.name}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.category}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
                <Button variant="outline" className="w-full bg-transparent">
                  Browse All Templates
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { event: "Order Fulfillment completed", time: "2 min ago", status: "success" },
                  { event: "Welcome email sent", time: "5 min ago", status: "success" },
                  { event: "Host alert triggered", time: "3 hours ago", status: "error" },
                  { event: "Review request sent", time: "15 min ago", status: "success" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.status === "success" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm">{activity.event}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
              <CardContent className="pt-6 text-center">
                <Zap className="h-10 w-10 mx-auto text-indigo-500 mb-3" />
                <h3 className="font-bold">N8N Connected</h3>
                <p className="text-sm text-muted-foreground mt-1">All systems operational</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  Manage Integrations
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
