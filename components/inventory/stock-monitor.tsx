"use client"

import { useEffect, useState } from "react"
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import type { StockLevel } from "@/lib/types"

interface StockMonitorProps {
  productId: string
  productTitle?: string
  showTrends?: boolean
  autoRefresh?: boolean
}

export function StockMonitor({
  productId,
  productTitle,
  showTrends = true,
  autoRefresh = true,
}: StockMonitorProps) {
  const [stock, setStock] = useState<StockLevel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchStockLevel = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/inventory/stock-levels?productId=${productId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch stock level")
      }

      const data = await response.json()
      setStock(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockLevel()

    if (autoRefresh) {
      const interval = setInterval(fetchStockLevel, 5000)
      return () => clearInterval(interval)
    }
  }, [productId, autoRefresh])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !stock) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            Stock Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || "No stock data available"}</p>
        </CardContent>
      </Card>
    )
  }

  const percentageReserved =
    stock.quantity_on_hand > 0
      ? Math.round((stock.quantity_reserved / stock.quantity_on_hand) * 100)
      : 0
  const percentageAvailable =
    stock.quantity_on_hand > 0 ? Math.round((stock.quantity_available / stock.quantity_on_hand) * 100) : 0

  const isLowStock = stock.quantity_available <= stock.reorder_point
  const stockStatus =
    stock.quantity_available === 0
      ? "Out of Stock"
      : isLowStock
        ? "Low Stock"
        : stock.quantity_available > stock.quantity_on_hand * 0.8
          ? "Well Stocked"
          : "Good Stock"

  const statusColor =
    stock.quantity_available === 0
      ? "destructive"
      : isLowStock
        ? "warning"
        : "default"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{productTitle || "Stock Level"}</CardTitle>
            <CardDescription>
              Last updated: {lastUpdate?.toLocaleTimeString()}
            </CardDescription>
          </div>
          <Badge variant={statusColor === "destructive" ? "destructive" : "secondary"}>
            {stockStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stock Display */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">On Hand</p>
            <p className="text-2xl font-bold">{stock.quantity_on_hand}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Reserved</p>
            <p className="text-2xl font-bold text-amber-600">{stock.quantity_reserved}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{stock.quantity_available}</p>
          </div>
        </div>

        {/* Stock Distribution */}
        <div className="space-y-3">
          <div>
            <div className="mb-2 flex justify-between">
              <p className="text-sm font-medium">Stock Distribution</p>
              <p className="text-xs text-muted-foreground">
                {percentageAvailable}% available
              </p>
            </div>
            <Progress value={percentageAvailable} className="h-2" />
          </div>

          {/* Reorder Information */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Reorder Point</p>
                <p className="text-sm">{stock.reorder_point} units</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Reorder Qty</p>
                <p className="text-sm">{stock.reorder_quantity} units</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {isLowStock && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-600" />
              <p className="text-xs text-amber-800">
                Stock is below reorder point. Consider placing a reorder.
              </p>
            </div>
          </div>
        )}

        {stock.quantity_available === 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
              <p className="text-xs text-red-800">
                Product is out of stock. Customers cannot purchase this item.
              </p>
            </div>
          </div>
        )}

        {/* Trends */}
        {showTrends && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Reservation Ratio</p>
              <div className="flex items-center gap-2">
                {percentageReserved > 50 ? (
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                )}
                <span className="text-sm font-semibold">{percentageReserved}%</span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stock.quantity_reserved} of {stock.quantity_on_hand} units reserved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
