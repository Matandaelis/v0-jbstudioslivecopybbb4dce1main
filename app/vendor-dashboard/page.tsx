"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  DollarSign,
  ShoppingBag,
  Truck,
  Plus,
  Eye,
  Edit,
  ArrowUpRight,
  Box,
  BarChart3,
  Clock,
  CheckCircle,
} from "lucide-react"

const VENDOR_STATS = {
  totalProducts: 48,
  activeProducts: 42,
  totalSales: 1250000,
  pendingOrders: 23,
  completedOrders: 456,
  returnRate: 2.3,
}

const PRODUCTS = [
  { id: 1, name: "Premium Hair Serum", price: 2500, stock: 45, sales: 234, status: "active" },
  { id: 2, name: "Matte Lipstick Set", price: 1800, stock: 12, sales: 189, status: "low-stock" },
  { id: 3, name: "Organic Face Cream", price: 3200, stock: 67, sales: 156, status: "active" },
  { id: 4, name: "Hair Growth Oil", price: 1500, stock: 0, sales: 98, status: "out-of-stock" },
  { id: 5, name: "Skin Brightening Mask", price: 2200, stock: 34, sales: 145, status: "active" },
]

const RECENT_ORDERS = [
  { id: "ORD-2024-001", product: "Premium Hair Serum", qty: 3, total: 7500, status: "processing", date: "Today" },
  { id: "ORD-2024-002", product: "Matte Lipstick Set", qty: 2, total: 3600, status: "shipped", date: "Yesterday" },
  { id: "ORD-2024-003", product: "Organic Face Cream", qty: 1, total: 3200, status: "delivered", date: "Dec 10" },
]

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview")

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-white/80 mt-1">Manage your products and track sales</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                <BarChart3 className="w-4 h-4 mr-2" /> Analytics
              </Button>
              <Button className="bg-white text-indigo-600 hover:bg-slate-100">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 -mb-px">
            {[
              { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
              { key: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
              { key: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-indigo-500 text-indigo-600"
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
                  label: "Total Products",
                  value: VENDOR_STATS.totalProducts,
                  icon: <Package className="w-5 h-5" />,
                  change: "+3",
                },
                {
                  label: "Total Sales",
                  value: `KES ${(VENDOR_STATS.totalSales / 1000).toFixed(0)}K`,
                  icon: <DollarSign className="w-5 h-5" />,
                  change: "+18%",
                },
                {
                  label: "Pending Orders",
                  value: VENDOR_STATS.pendingOrders,
                  icon: <Clock className="w-5 h-5" />,
                  change: null,
                },
                {
                  label: "Completed",
                  value: VENDOR_STATS.completedOrders,
                  icon: <CheckCircle className="w-5 h-5" />,
                  change: "+12%",
                },
              ].map((stat, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100 text-indigo-600">
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

            {/* Quick Overview */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {PRODUCTS.slice(0, 4).map((product, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.sales} sold</p>
                          </div>
                        </div>
                        <p className="font-semibold text-indigo-600">KES {product.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {RECENT_ORDERS.map((order, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{order.product}</p>
                          <p className="text-xs text-slate-500">
                            {order.id} • {order.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">KES {order.total.toLocaleString()}</p>
                          <Badge
                            variant="outline"
                            className={
                              order.status === "delivered"
                                ? "text-green-600 border-green-200"
                                : order.status === "shipped"
                                  ? "text-blue-600 border-blue-200"
                                  : "text-yellow-600 border-yellow-200"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Product Catalog</h2>
              <Button className="bg-indigo-500 hover:bg-indigo-600">
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Product</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Stock</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Sales</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PRODUCTS.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-slate-400" />
                          </div>
                          <span className="font-medium text-slate-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">KES {product.price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{product.stock}</td>
                      <td className="px-4 py-3 text-slate-600">{product.sales}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            product.status === "active"
                              ? "text-green-600 border-green-200 bg-green-50"
                              : product.status === "low-stock"
                                ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                                : "text-red-600 border-red-200 bg-red-50"
                          }
                        >
                          {product.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="bg-transparent">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Management</h2>
            <div className="space-y-4">
              {[...RECENT_ORDERS, ...RECENT_ORDERS].map((order, idx) => (
                <Card key={idx}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-600"
                              : order.status === "shipped"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-yellow-100 text-yellow-600"
                          }`}
                        >
                          {order.status === "delivered" ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : order.status === "shipped" ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{order.id}</p>
                          <p className="text-sm text-slate-500">
                            {order.product} x {order.qty}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">KES {order.total.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">{order.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          order.status === "delivered"
                            ? "text-green-600 border-green-200"
                            : order.status === "shipped"
                              ? "text-blue-600 border-blue-200"
                              : "text-yellow-600 border-yellow-200"
                        }
                      >
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
