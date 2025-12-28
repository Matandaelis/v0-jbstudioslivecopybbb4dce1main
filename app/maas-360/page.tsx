"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  Database,
  Server,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Cpu,
  Network,
} from "lucide-react"

const MAAS_STATS = {
  activeTenants: 24,
  totalUsers: 45000,
  systemUptime: 99.9,
  activeIntegrations: 18,
  dataProcessed: 2.5,
  apiCalls: 12500000,
}

const TENANTS = [
  { name: "BrownBeauty Kenya", users: 12500, status: "active", tier: "Enterprise" },
  { name: "GearNation Uganda", users: 8900, status: "active", tier: "Pro" },
  { name: "BeautyGlow Tanzania", users: 6500, status: "active", tier: "Pro" },
  { name: "AutoHub Rwanda", users: 4200, status: "maintenance", tier: "Starter" },
]

const INTEGRATIONS = [
  { name: "Perfex CRM", status: "connected", lastSync: "2 min ago" },
  { name: "WooCommerce", status: "connected", lastSync: "5 min ago" },
  { name: "Mailcow Email", status: "connected", lastSync: "1 min ago" },
  { name: "Chatwoot", status: "warning", lastSync: "15 min ago" },
  { name: "n8n Workflows", status: "connected", lastSync: "3 min ago" },
]

export default function MaaS360() {
  const [activeTab, setActiveTab] = useState<"overview" | "tenants" | "integrations" | "system">("overview")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">MaaS 360</h1>
              </div>
              <p className="text-white/80">Multi-tenant Architecture & System Management</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold">{MAAS_STATS.systemUptime}%</p>
                <p className="text-xs text-white/70">Uptime</p>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold">{MAAS_STATS.activeTenants}</p>
                <p className="text-xs text-white/70">Tenants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
              { key: "tenants", label: "Tenants", icon: <Building2 className="w-4 h-4" /> },
              { key: "integrations", label: "Integrations", icon: <Network className="w-4 h-4" /> },
              { key: "system", label: "System Health", icon: <Server className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
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
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Users",
                  value: `${(MAAS_STATS.totalUsers / 1000).toFixed(0)}K`,
                  icon: <Users className="w-5 h-5" />,
                  change: "+12%",
                },
                {
                  label: "Active Integrations",
                  value: MAAS_STATS.activeIntegrations,
                  icon: <Network className="w-5 h-5" />,
                  change: "+3",
                },
                {
                  label: "Data Processed",
                  value: `${MAAS_STATS.dataProcessed}TB`,
                  icon: <Database className="w-5 h-5" />,
                  change: "+0.4TB",
                },
                {
                  label: "API Calls/Day",
                  value: `${(MAAS_STATS.apiCalls / 1000000).toFixed(1)}M`,
                  icon: <Cpu className="w-5 h-5" />,
                  change: "+15%",
                },
              ].map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
                        {stat.icon}
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {TENANTS.map((tenant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center font-semibold text-slate-600">
                            {tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{tenant.name}</p>
                            <p className="text-xs text-slate-500">{tenant.users.toLocaleString()} users</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tenant.tier}</Badge>
                          <Badge
                            className={
                              tenant.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {tenant.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integration Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {INTEGRATIONS.map((integration, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {integration.status === "connected" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-medium text-slate-900">{integration.name}</span>
                        </div>
                        <span className="text-sm text-slate-500">{integration.lastSync}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "tenants" && (
          <div className="space-y-4">
            {TENANTS.map((tenant, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-600">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{tenant.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{tenant.tier}</Badge>
                          <Badge
                            className={
                              tenant.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {tenant.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{tenant.users.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Users</p>
                      </div>
                      <Button variant="outline" className="bg-transparent">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {INTEGRATIONS.map((integration, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Network className="w-6 h-6 text-slate-600" />
                    </div>
                    {integration.status === "connected" ? (
                      <Badge className="bg-green-100 text-green-700">Connected</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{integration.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">Last sync: {integration.lastSync}</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    <Settings className="w-4 h-4 mr-2" /> Configure
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "system" && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "API Server", status: "healthy", load: 45, memory: 62 },
              { name: "Database Cluster", status: "healthy", load: 38, memory: 71 },
              { name: "Cache Server", status: "healthy", load: 22, memory: 45 },
              { name: "Worker Nodes", status: "healthy", load: 56, memory: 58 },
            ].map((server, idx) => (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Server className="w-6 h-6 text-slate-600" />
                      <h3 className="font-semibold text-slate-900">{server.name}</h3>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" /> Healthy
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">CPU Load</p>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${server.load}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{server.load}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Memory</p>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${server.memory}%` }} />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{server.memory}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
