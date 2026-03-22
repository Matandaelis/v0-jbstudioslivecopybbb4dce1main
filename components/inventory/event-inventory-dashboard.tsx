"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, TrendingUp, Users, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface EventProduct {
  id: string
  product_id: string
  event_id: string
  featured_position?: number
  special_discount?: number
  quantity_available: number
  quantity_sold: number
  products: {
    id: string
    title: string
    price: number
    thumbnail_url?: string
  }
}

interface EventInventoryDashboardProps {
  eventId: string
  eventTitle?: string
}

export function EventInventoryDashboard({
  eventId,
  eventTitle = "Live Event",
}: EventInventoryDashboardProps) {
  const [products, setProducts] = useState<EventProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalViews, setTotalViews] = useState(0)
  const [totalSales, setTotalSales] = useState(0)

  const fetchEventInventory = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/inventory/events?eventId=${eventId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch event inventory")
      }

      const data = await response.json()
      setProducts(data)

      // Calculate totals
      const sales = data.reduce((sum: number, p: EventProduct) => sum + p.quantity_sold, 0)
      setTotalSales(sales)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEventInventory()

    // Auto-refresh every 3 seconds during live event
    const interval = setInterval(fetchEventInventory, 3000)
    return () => clearInterval(interval)
  }, [eventId])

  const handleSyncInventory = async () => {
    try {
      const productIds = products.map((p) => p.product_id)
      const response = await fetch("/api/inventory/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          productIds,
          action: "sync",
        }),
      })

      if (response.ok) {
        await fetchEventInventory()
      }
    } catch (err) {
      console.error("Failed to sync inventory:", err)
    }
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            Error Loading Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchEventInventory} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">items sold during event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Products Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">in this event</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {products.filter((p) => p.quantity_available < 5).length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{eventTitle} - Inventory</CardTitle>
              <CardDescription>Real-time product stock during live event</CardDescription>
            </div>
            <Button onClick={handleSyncInventory} size="sm" variant="outline">
              Sync Inventory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Available</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const conversionRate =
                    (product.quantity_sold / (product.quantity_available + product.quantity_sold)) *
                    100 || 0
                  const isLowStock = product.quantity_available < 5

                  return (
                    <TableRow key={product.id} className={isLowStock ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.products.thumbnail_url && (
                            <img
                              src={product.products.thumbnail_url}
                              alt={product.products.title}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="line-clamp-1">{product.products.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.products.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold">{product.quantity_available}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ShoppingCart className="h-3 w-3 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {product.quantity_sold}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.special_discount ? (
                          <Badge variant="secondary">{product.special_discount}% off</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.quantity_available === 0 ? (
                          <Badge variant="destructive">Out of Stock</Badge>
                        ) : isLowStock ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            In Stock
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No products featured in this event yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
