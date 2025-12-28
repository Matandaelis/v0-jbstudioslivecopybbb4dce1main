"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  Users,
  Settings,
  Database,
  Server,
  Activity,
  Key,
  Lock,
  UserCog,
  Globe,
  Bell,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react"

const SYSTEM_STATS = {
  totalUsers: 45000,
  activeHosts: 2500,
  totalRevenue: 125000000,
  systemHealth: 99.9,
}

const ADMIN_USERS = [
  { name: "John Admin", role: "Super Admin", lastActive: "Now", status: "online" },
  { name: "Sarah Mod", role: "Moderator", lastActive: "5 min ago", status: "online" },
  { name: "Mike Support", role: "Support Lead", lastActive: "1 hour ago", status: "offline" },
]

const SYSTEM_LOGS = [
  { action: "User role updated", user: "admin@jb.com", time: "2 min ago", type: "info" },
  { action: "Payment gateway connected", user: "system", time: "15 min ago", type: "success" },
  { action: "Failed login attempt", user: "unknown", time: "1 hour ago", type: "warning" },
  { action: "Database backup completed", user: "system", time: "3 hours ago", type: "success" },
]

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "system" | "logs">("dashboard")

  return (
    <ProtectedRoute requiredRole={["admin"]}>
      <div className="min-h-screen bg-slate-900">
        <Navigation />

        {/* Header */}
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">Super Admin</h1>
                </div>
                <p className="text-white/80">System administration and control panel</p>
              </div>
              <Badge className="bg-red-500 text-white text-sm px-4 py-1">
                <Lock className="w-4 h-4 mr-2" /> Elevated Access
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700 bg-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-1 -mb-px">
              {[
                { key: "dashboard", label: "Dashboard", icon: <BarChart3 className="w-4 h-4" /> },
                { key: "users", label: "User Management", icon: <Users className="w-4 h-4" /> },
                { key: "system", label: "System Config", icon: <Settings className="w-4 h-4" /> },
                { key: "logs", label: "Activity Logs", icon: <FileText className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-red-500 text-red-400"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {activeTab === "dashboard" && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Users",
                    value: `${(SYSTEM_STATS.totalUsers / 1000).toFixed(0)}K`,
                    icon: <Users className="w-5 h-5" />,
                  },
                  {
                    label: "Active Hosts",
                    value: SYSTEM_STATS.activeHosts.toLocaleString(),
                    icon: <Activity className="w-5 h-5" />,
                  },
                  {
                    label: "Total Revenue",
                    value: `KES ${(SYSTEM_STATS.totalRevenue / 1000000).toFixed(0)}M`,
                    icon: <Database className="w-5 h-5" />,
                  },
                  {
                    label: "System Health",
                    value: `${SYSTEM_STATS.systemHealth}%`,
                    icon: <Server className="w-5 h-5" />,
                  },
                ].map((stat, idx) => (
                  <Card key={idx} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-900/50 text-red-400">
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Admin Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ADMIN_USERS.map((user, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-900 flex items-center justify-center font-semibold text-red-400">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-slate-400">{user.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${user.status === "online" ? "bg-green-500" : "bg-slate-500"}`}
                            />
                            <span className="text-sm text-slate-400">{user.lastActive}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {SYSTEM_LOGS.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                log.type === "success"
                                  ? "bg-green-500"
                                  : log.type === "warning"
                                    ? "bg-yellow-500"
                                    : "bg-blue-500"
                              }`}
                            />
                            <div>
                              <p className="font-medium text-white text-sm">{log.action}</p>
                              <p className="text-xs text-slate-400">{log.user}</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">User Management</CardTitle>
                <Button className="bg-red-500 hover:bg-red-600">
                  <UserCog className="w-4 h-4 mr-2" /> Add Admin
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ADMIN_USERS.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-900 flex items-center justify-center font-bold text-red-400">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{user.name}</h4>
                          <Badge variant="outline" className="text-red-400 border-red-400 mt-1">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300">
                          <Key className="w-4 h-4 mr-1" /> Reset Password
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300">
                          <Settings className="w-4 h-4 mr-1" /> Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "system" && (
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "Regional Settings",
                  desc: "Configure East Africa regions and languages",
                },
                {
                  icon: <Bell className="w-6 h-6" />,
                  title: "Notification System",
                  desc: "Email, SMS, and push notification settings",
                },
                {
                  icon: <Database className="w-6 h-6" />,
                  title: "Database Management",
                  desc: "Backup, restore, and optimization",
                },
                { icon: <Key className="w-6 h-6" />, title: "API Keys", desc: "Manage third-party integrations" },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "Security Settings",
                  desc: "Authentication and access control",
                },
                {
                  icon: <Server className="w-6 h-6" />,
                  title: "Server Configuration",
                  desc: "Performance and scaling options",
                },
              ].map((config, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-red-900/50 flex items-center justify-center text-red-400">
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{config.title}</h3>
                        <p className="text-sm text-slate-400">{config.desc}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "logs" && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...SYSTEM_LOGS, ...SYSTEM_LOGS].map((log, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl ${
                        log.type === "warning" ? "bg-yellow-900/20 border border-yellow-600/30" : "bg-slate-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {log.type === "warning" ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        ) : log.type === "success" ? (
                          <Activity className="w-5 h-5 text-green-500" />
                        ) : (
                          <FileText className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium text-white">{log.action}</p>
                          <p className="text-sm text-slate-400">By: {log.user}</p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  )
}
