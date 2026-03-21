"use client"

import { useState, useRef, useEffect } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Play,
  Eye,
  Heart,
  ShoppingBag,
  Send,
  MessageSquare,
  Users,
  Star,
  TrendingUp,
  Zap,
  ChevronDown,
  X,
  Smile,
} from "lucide-react"

interface Message {
  id: string
  user: string
  message: string
  timestamp: Date
  role?: "host" | "moderator" | "viewer"
}

interface Product {
  id: number
  name: string
  price: number
  originalPrice: number
  image: string
  stock: number
  rating: number
  reviews: number
  trending: boolean
}

interface LiveStream {
  id: number
  host: string
  title: string
  viewers: number
  thumbnail: string
  isLive: boolean
  category: string
  products: Product[]
  rating: number
}

const MOCK_LIVE_STREAM: LiveStream = {
  id: 1,
  host: "Sarah Kimani",
  title: "Premium Skincare Routine - Live Demo & Shopping",
  viewers: 3421,
  thumbnail: "/beauty-makeup-tutorial-live-stream.jpg",
  isLive: true,
  category: "beauty",
  rating: 4.9,
  products: [
    {
      id: 1,
      name: "Hydrating Face Serum",
      price: 45,
      originalPrice: 65,
      image: "/beauty-serum-product.jpg",
      stock: 12,
      rating: 4.8,
      reviews: 234,
      trending: true,
    },
    {
      id: 2,
      name: "Glow Moisturizer",
      price: 52,
      originalPrice: 79,
      image: "/beauty-moisturizer-product.jpg",
      stock: 8,
      rating: 4.7,
      reviews: 189,
      trending: true,
    },
    {
      id: 3,
      name: "Vitamin C Eye Cream",
      price: 38,
      originalPrice: 58,
      image: "/beauty-eye-cream-product.jpg",
      stock: 15,
      rating: 4.9,
      reviews: 412,
      trending: false,
    },
  ],
}

const REACTIONS = ["❤️", "🔥", "😍", "🎉", "👏", "🚀"]

export default function LiveShopping() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showChat, setShowChat] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  const [reactions, setReactions] = useState<{ id: string; emoji: string; position: { x: number; y: number } }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamVideoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      user: "You",
      message: input,
      timestamp: new Date(),
      role: "viewer",
    }
    setMessages((prev) => [...prev, newMessage])
    setInput("")
  }

  const handleReaction = (emoji: string) => {
    const id = `reaction_${Date.now()}`
    const randomX = Math.random() * 80 + 10
    const randomY = Math.random() * 40 + 20

    setReactions((prev) => [...prev, { id, emoji, position: { x: randomX, y: randomY } }])
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id))
    }, 2000)
  }

  const handleAddToCart = (product: Product) => {
    const notification = `Added ${product.name} to cart!`
    console.log(notification)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="w-full bg-gradient-to-b from-primary/10 to-background pb-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          {/* Live Stream Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{MOCK_LIVE_STREAM.title}</h1>
                <p className="text-sm text-muted-foreground">Hosted by {MOCK_LIVE_STREAM.host}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white dark:bg-card rounded-full px-4 py-2 shadow-sm">
                <Eye className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">{MOCK_LIVE_STREAM.viewers.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-card rounded-full px-4 py-2 shadow-sm">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-sm">{MOCK_LIVE_STREAM.rating}</span>
              </div>
            </div>
          </div>

          {/* Stream Content Area - Mobile First */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Video Area */}
            <div className="lg:col-span-3">
              <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
                <div
                  ref={streamVideoRef}
                  className="relative w-full aspect-video bg-gradient-to-br from-slate-900 via-slate-800 to-black flex items-center justify-center group"
                >
                  <img
                    src={MOCK_LIVE_STREAM.thumbnail}
                    alt="Live stream"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all" />

                  {/* Play Button */}
                  <Button className="relative z-10 bg-primary hover:bg-primary/90 rounded-full w-16 h-16 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 ml-1" />
                  </Button>

                  {/* Floating Reactions */}
                  {reactions.map((reaction) => (
                    <div
                      key={reaction.id}
                      className="absolute text-4xl font-bold animate-bounce pointer-events-none"
                      style={{
                        left: `${reaction.position.x}%`,
                        top: `${reaction.position.y}%`,
                        animation: "float-up 2s ease-out forwards",
                      }}
                    >
                      {reaction.emoji}
                    </div>
                  ))}

                  {/* Quick Reaction Buttons - Visible on hover/mobile */}
                  <div className="absolute bottom-4 left-4 right-4 flex gap-2 justify-center lg:justify-start opacity-0 group-hover:opacity-100 transition-opacity">
                    {REACTIONS.slice(0, 3).map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="text-2xl p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Featured Product Spotlight */}
                {selectedProduct && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <div className="flex gap-3">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm">{selectedProduct.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xl font-bold text-white">${selectedProduct.price}</span>
                          <span className="text-xs text-white/60 line-through">${selectedProduct.originalPrice}</span>
                          <Badge className="bg-red-500 text-white text-xs">
                            {Math.round((1 - selectedProduct.price / selectedProduct.originalPrice) * 100)}% OFF
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="bg-secondary hover:bg-secondary/90 text-white font-bold"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Featured Products Grid - Below Video */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" />
                    Featured Products
                  </h2>
                  <button className="text-primary font-semibold text-sm hover:underline flex items-center gap-1">
                    See all
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_LIVE_STREAM.products.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 border-0"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="relative bg-muted">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                        {product.trending && (
                          <Badge className="absolute top-3 right-3 bg-secondary text-white">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                        <Badge className="absolute top-3 left-3 bg-primary text-white font-bold">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-sm text-foreground mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl font-bold text-primary">${product.price}</span>
                          <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-semibold">{product.rating}</span>
                            <span className="text-muted-foreground">({product.reviews})</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {product.stock} in stock
                          </Badge>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToCart(product)
                          }}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold"
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Chat & Viewers (Mobile: Hidden until scrolled) */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Chat Panel */}
              <Card className="flex flex-col h-96 lg:h-[600px] border-0 shadow-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-sm">Live Chat</h3>
                  </div>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="lg:hidden p-1 hover:bg-muted rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-card/50">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground text-sm">
                      <div>
                        <MessageSquare className="w-8 h-8 opacity-50 mx-auto mb-2" />
                        <p>Say hello to the stream!</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="text-xs space-y-0.5 animate-fadeIn">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-foreground text-xs">{msg.user}</span>
                          {msg.role === "host" && (
                            <Badge className="bg-secondary text-white text-xs px-1.5 py-0">HOST</Badge>
                          )}
                          {msg.role === "moderator" && (
                            <Badge className="bg-primary text-white text-xs px-1.5 py-0">MOD</Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs break-words">{msg.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-white dark:bg-card">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Say something..."
                      className="text-sm h-9"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </Card>

              {/* Reaction Buttons */}
              <Card className="p-4 border-0 shadow-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-3">Quick Reactions</p>
                <div className="grid grid-cols-3 gap-2">
                  {REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="text-3xl p-2 bg-muted hover:bg-primary/20 rounded-lg transition-all transform hover:scale-110"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Active Viewers */}
              <Card className="p-4 border-0 shadow-lg">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Active Now
                </h3>
                <div className="space-y-2">
                  {["Sarah K.", "Mike O.", "Grace W.", "James M.", "Faith N."].map((name) => (
                    <div
                      key={name}
                      className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-xs font-medium text-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <Footer />
    </div>
  )
}
