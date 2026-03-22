"use client"

import { useState } from "react"
import { AlertCircle, Check, Loader2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface StockAdjustmentFormProps {
  productId: string
  productTitle?: string
  currentStock?: number
  onSuccess?: (data: any) => void
}

type MovementType = "inbound" | "outbound" | "adjustment" | "return"

const MOVEMENT_TYPES: { value: MovementType; label: string; description: string }[] = [
  {
    value: "inbound",
    label: "Inbound",
    description: "Receiving new stock from suppliers",
  },
  {
    value: "outbound",
    label: "Outbound",
    description: "Manual stock removal",
  },
  {
    value: "adjustment",
    label: "Inventory Adjustment",
    description: "Correcting stock count discrepancies",
  },
  {
    value: "return",
    label: "Return",
    description: "Customer returns and restocking",
  },
]

export function StockAdjustmentForm({
  productId,
  productTitle = "Product",
  currentStock = 0,
  onSuccess,
}: StockAdjustmentFormProps) {
  const [quantity, setQuantity] = useState<number>(0)
  const [movementType, setMovementType] = useState<MovementType>("inbound")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleQuickAdjust = (change: number) => {
    setQuantity(Math.max(0, quantity + change))
  }

  const validateForm = (): boolean => {
    if (quantity === 0) {
      setError("Please enter a quantity")
      return false
    }

    if (movementType === "outbound" && quantity > currentStock) {
      setError(`Cannot remove ${quantity} items. Only ${currentStock} available.`)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/inventory/stock-levels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantityChange: movementType === "outbound" ? -quantity : quantity,
          movementType,
          notes: notes || `${movementType} adjustment for ${productTitle}`,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to adjust stock")
      }

      const data = await response.json()

      setSuccess(true)
      setQuantity(0)
      setNotes("")
      setMovementType("inbound")

      if (onSuccess) {
        onSuccess(data)
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const currentMovementType = MOVEMENT_TYPES.find((t) => t.value === movementType)
  const projectedStock =
    movementType === "outbound" ? currentStock - quantity : currentStock + quantity

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Stock Adjustment</CardTitle>
        <CardDescription>
          Adjust inventory for {productTitle || "your product"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Stock Display */}
          <div className="rounded-lg bg-muted p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Current Stock</p>
                <p className="text-2xl font-bold">{currentStock}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Projected Stock</p>
                <p className={`text-2xl font-bold ${projectedStock < 0 ? "text-red-600" : "text-green-600"}`}>
                  {projectedStock}
                </p>
              </div>
            </div>
          </div>

          {/* Movement Type Selection */}
          <div className="space-y-3">
            <Label htmlFor="movement-type" className="text-base font-semibold">
              Adjustment Type
            </Label>
            <Select value={movementType} onValueChange={(value) => setMovementType(value as MovementType)}>
              <SelectTrigger id="movement-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentMovementType && (
              <p className="text-xs text-muted-foreground">{currentMovementType.description}</p>
            )}
          </div>

          {/* Quantity Input */}
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-base font-semibold">
              Quantity {movementType === "outbound" ? "to Remove" : "to Add"}
            </Label>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust(-10)}
                disabled={quantity < 10}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust(-1)}
                disabled={quantity < 1}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="0"
                className="text-center text-lg font-semibold"
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust(1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleQuickAdjust(10)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(10)}
              >
                +10
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(25)}
              >
                +25
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(50)}
              >
                +50
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setQuantity(100)}
              >
                +100
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-base font-semibold">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this adjustment (e.g., PO#12345, supplier damage, quality inspection, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              These notes will be recorded in the audit trail
            </p>
          </div>

          {/* Validation Alerts */}
          {projectedStock < 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Projected stock is negative. This adjustment will create negative inventory.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Stock adjustment recorded successfully
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || quantity === 0}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Processing..." : "Record Adjustment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuantity(0)
                setNotes("")
                setError(null)
              }}
            >
              Clear
            </Button>
          </div>

          {/* Summary */}
          {quantity > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">Summary:</span> This will{" "}
                <span className="font-semibold">
                  {movementType === "outbound" ? "remove" : "add"}
                </span>{" "}
                <Badge variant="secondary" className="ml-1">
                  {quantity}
                </Badge>{" "}
                units from inventory. The system will record this as a{" "}
                <span className="font-semibold">{movementType}</span> movement.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
