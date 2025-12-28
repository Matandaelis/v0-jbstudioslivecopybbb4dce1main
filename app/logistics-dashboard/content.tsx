"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Truck, Package, MapPin, Clock, CheckCircle, Search, BarChart3, Star } from "lucide-react"

const LOGISTICS_STATS = {
  totalOrders: 4560,
  inTransit: 234,
  delivered: 4180,
  pending: 146,
  avgDeliveryTime: "2.3 days",
}

const ORDERS = [
  {
    id: "ORD-2024-001",
    customer: "Jane Doe",
    items: 3,
    status: "delivered",
    location: "Nairobi",
    date: "Today",
    total: 5500,
  },
  {
    id: "ORD-2024-002",
    customer: "John Smith",
    items: 1,
    status: "in-transit",
    location: "Mombasa",
    date: "Today",
    total: 2800,
  },
  {
    id: "ORD-2024-003",
    customer: "Mary Wangari",
    items: 5,
    status: "processing",
    location: "Kisumu",
    date: "Yesterday",
    total: 12500,
  },
  {
    id: "ORD-2024-004",
    customer: "Peter Omondi",
    items: 2,
    status: "delivered",
    location: "Nakuru",
    date: "Yesterday",
    total: 4200,
  },
  {
    id: "ORD-2024-005",
    customer: "Grace Akinyi",
    items: 4,
    status: "pending",
    location: "Eldoret",
    date: "2 days ago",
    total: 8900,
  },
]

const DELIVERY_PARTNERS = [
  { name: "Sendy", orders: 156, rating: 4.8, avgTime: "1.8 days" },
  { name: "Glovo", orders: 89, rating: 4.6, avgTime: "2.1 days" },
  { name: "JB Express", orders: 234, rating: 4.9, avgTime: "1.5 days" },
]

export default function LogisticsDashboardContent() {
  const [activeTab, setActiveTab] = useState<"orders" | "tracking" | "partners" | "analytics">("orders")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredOrders = statusFilter === "all" ? ORDERS : ORDERS.filter((o) => o.status === statusFilter)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">Logistics Dashboard</h1>
              </div>
              <p className="text-white/80">Track orders and manage deliveries</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" /> Reports
              </Button>
              <Button className="bg-white text-teal-600 hover:bg-slate-100">
                <Package className="w-4 h-4 mr-2" /> New Shipment
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
              label: "Total Orders",
              value: LOGISTICS_STATS.totalOrders.toLocaleString(),
              icon: <Package className="w-5 h-5" />,
              color: "bg-blue-100 text-blue-600",
            },
            {
              label: "In Transit",
              value: LOGISTICS_STATS.inTransit,
              icon: <Truck className="w-5 h-5" />,
              color: "bg-yellow-100 text-yellow-600",
            },
            {
              label: "Delivered",
              value: LOGISTICS_STATS.delivered.toLocaleString(),
              icon: <CheckCircle className="w-5 h-5" />,
              color: "bg-green-100 text-green-600",
            },
            {
              label: "Pending",
              value: LOGISTICS_STATS.pending,
              icon: <Clock className="w-5 h-5" />,
              color: "bg-orange-100 text-orange-600",
            },
            {
              label: "Avg Delivery",
              value: LOGISTICS_STATS.avgDeliveryTime,
              icon: <MapPin className="w-5 h-5" />,
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
            { key: "orders", label: "Orders" },
            { key: "tracking", label: "Live Tracking" },
            { key: "partners", label: "Delivery Partners" },
            { key: "analytics", label: "Analytics" },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={activeTab === tab.key ? "bg-teal-500" : "bg-transparent"}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        {activeTab === "orders" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Management</CardTitle>
              <div className="flex gap-2">
                <select
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Search className="w-4 h-4 mr-2" /> Search
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-600"
                            : order.status === "in-transit"
                              ? "bg-blue-100 text-blue-600"
                              : order.status === "processing"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {order.status === "delivered" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : order.status === "in-transit" ? (
                          <Truck className="w-5 h-5" />
                        ) : (
                          <Package className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <p className="text-sm text-slate-500">
                          {order.customer} • {order.items} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-teal-600">KES {order.total.toLocaleString()}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {order.location}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "delivered"
                            ? "text-green-600 border-green-200 bg-green-50"
                            : order.status === "in-transit"
                              ? "text-blue-600 border-blue-200 bg-blue-50"
                              : order.status === "processing"
                                ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                                : "text-orange-600 border-orange-200 bg-orange-50"
                        }
                      >
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "tracking" && (
          <Card>
            <CardHeader>
              <CardTitle>Live Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-slate-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Map view showing active deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "partners" && (
          <div className="grid md:grid-cols-3 gap-4">
            {DELIVERY_PARTNERS.map((partner) => (
              <Card key={partner.name} className="bg-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Orders Delivered</span>
                      <span className="font-bold text-teal-600">{partner.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Rating</span>
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{partner.rating}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Avg Delivery</span>
                      <span className="font-bold">{partner.avgTime}</span>
                    </div>
                    <Button className="w-full mt-4 bg-teal-500 hover:bg-teal-600">Send Package</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Chart showing delivery metrics</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">Map showing order distribution</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
