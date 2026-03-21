"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag, Star, TrendingUp } from "lucide-react"
import { useState } from "react"

interface ProductCardProps {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  stock: number
  rating: number
  reviews: number
  trending?: boolean
  category?: "beauty" | "auto"
  onAddToCart?: (product: ProductCardProps) => void
  onLike?: (id: number) => void
  onSelect?: (product: ProductCardProps) => void
}

export default function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  stock,
  rating,
  reviews,
  trending = false,
  category = "beauty",
  onAddToCart,
  onLike,
  onSelect,
}: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)

  const discountPercent = Math.round((1 - price / originalPrice) * 100)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked(!isLiked)
    onLike?.(id)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddToCart?.({
      id,
      name,
      price,
      originalPrice,
      image,
      stock,
      rating,
      reviews,
      trending,
      category,
    })
  }

  return (
    <Card
      onClick={() => onSelect?.({ id, name, price, originalPrice, image, stock, rating, reviews, trending, category })}
      className="overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer border-0 transform hover:-translate-y-2"
    >
      {/* Image Section */}
      <div className="relative bg-muted overflow-hidden h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
          <Badge className="bg-primary text-white font-bold text-xs px-2 py-1">
            {discountPercent}% OFF
          </Badge>
          {trending && (
            <Badge className="bg-secondary text-white text-xs px-2 py-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Trending
            </Badge>
          )}
        </div>

        {/* Stock Level */}
        <div className="absolute bottom-3 right-3">
          <Badge
            variant="outline"
            className={`text-xs font-semibold backdrop-blur-sm ${
              stock > 5
                ? "bg-green-500/20 text-green-700 border-green-500/30"
                : stock > 0
                  ? "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
                  : "bg-red-500/20 text-red-700 border-red-500/30"
            }`}
          >
            {stock > 0 ? `${stock} left` : "Out of stock"}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4">
        {/* Title */}
        <h3 className="font-bold text-foreground line-clamp-2 text-sm mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-sm text-foreground">{rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews} reviews)</span>
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">${price}</span>
          <span className="text-sm text-muted-foreground line-through">${originalPrice}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLike}
            className={`flex-shrink-0 border-border hover:border-primary ${
              isLiked
                ? "bg-red-50 dark:bg-red-950 border-red-500/50"
                : "hover:bg-muted"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </Button>
          <Button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-semibold"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
