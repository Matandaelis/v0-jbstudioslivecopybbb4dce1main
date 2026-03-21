# Developer Guide - Live Shopping Platform UI

## Quick Start

### Viewing the New Design

1. **Live Shopping Page**: Navigate to `/live-shopping`
   - Main live shopping experience
   - Video player with reactions
   - Product grid
   - Live chat
   - Viewers list

2. **Live Showcase**: Navigate to `/live-showcase`
   - Stream discovery page
   - Featured hosts
   - Filter and search
   - Stream cards with ratings

### Using New Components

#### ProductCard Component
```jsx
import ProductCard from "@/components/product-card"

export default function ProductGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard
        id={1}
        name="Hydrating Face Serum"
        price={45}
        originalPrice={65}
        image="/serum.jpg"
        stock={12}
        rating={4.8}
        reviews={234}
        trending={true}
        category="beauty"
        onAddToCart={(product) => {
          // Handle add to cart
          console.log("Added to cart:", product)
        }}
        onLike={(id) => {
          // Handle like/favorite
          console.log("Liked product:", id)
        }}
        onSelect={(product) => {
          // Handle product selection
          console.log("Selected product:", product)
        }}
      />
    </div>
  )
}
```

#### ReactionsPanel Component
```jsx
import ReactionsPanel from "@/components/livekit/reactions-panel"
import { useState } from "react"

export default function StreamWithReactions() {
  const [reactions, setReactions] = useState([])

  const handleReaction = (emoji) => {
    console.log("Reaction:", emoji)
    // Send reaction to server
    // Add to reactions array
  }

  return (
    <ReactionsPanel
      onReaction={handleReaction}
      reactions={reactions}
    />
  )
}
```

#### ViewersList Component
```jsx
import ViewersList from "@/components/livekit/viewers-list"

export default function StreamInfo() {
  const viewers = [
    { id: "1", name: "Sarah K.", role: "viewer", isFollowing: true },
    { id: "2", name: "Grace W.", role: "moderator", isFollowing: true },
    // ... more viewers
  ]

  return (
    <ViewersList
      viewers={viewers}
      totalViewers={3421}
      maxDisplay={5}
    />
  )
}
```

---

## Design Tokens Reference

### Using Color Tokens

```jsx
// Primary (Teal-Blue) - Brand color
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>

// Secondary (Coral) - Accent color
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80">
  Secondary Button
</button>

// Card & Background
<div className="bg-card text-card-foreground">
  Card content
</div>

<div className="bg-background text-foreground">
  Background content
</div>

// Muted elements
<span className="text-muted-foreground">Muted text</span>
<div className="bg-muted">Muted background</div>
```

### Using Shadow Tokens

```jsx
// Subtle shadow
<div className="shadow-sm">Subtle</div>

// Medium shadow (default for cards)
<div className="shadow-md">Medium</div>

// Large shadow (modals, important elements)
<div className="shadow-lg">Large</div>

// Extra large shadow (prominent hover states)
<div className="shadow-2xl">Extra Large</div>
```

### Using Spacing Tokens

```jsx
// Gap classes (space between children)
<div className="flex gap-4">Items with 1rem spacing</div>
<div className="grid gap-6">Grid with 1.5rem gaps</div>

// Padding
<div className="p-4">16px padding all sides</div>
<div className="px-6 py-4">24px horizontal, 16px vertical</div>

// Margin
<div className="mb-4">Margin bottom 1rem</div>
<div className="mx-2 my-4">Margin 0.5rem horizontal, 1rem vertical</div>

// Space stacking
<div className="space-y-3">Vertical spacing between children</div>
<div className="space-x-4">Horizontal spacing between children</div>
```

---

## Responsive Design Patterns

### Mobile-First Grid
```jsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>
```

### Hide/Show Elements by Screen Size
```jsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">
  Large screen only
</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">
  Mobile only
</div>

// Different layouts per screen
<div className="flex flex-col lg:flex-row">
  Mobile: column layout, Desktop: row layout
</div>
```

### Responsive Font Sizes
```jsx
<h1 className="text-2xl sm:text-3xl lg:text-4xl">
  Responsive heading
</h1>

<p className="text-sm sm:text-base lg:text-lg">
  Responsive body text
</p>
```

### Responsive Padding/Spacing
```jsx
<div className="p-2 sm:p-4 lg:p-6">
  Responsive padding: 8px → 16px → 24px
</div>

<div className="gap-2 sm:gap-4 lg:gap-6">
  Responsive gap: 8px → 16px → 24px
</div>
```

---

## Animation Guide

### Using Built-in Animations

```jsx
// Float up (for reactions)
<div className="animate-float-up">
  ❤️
</div>

// Fade in (for messages)
<div className="animate-fade-in">
  New message
</div>

// Slide in (for panels)
<div className="animate-slide-in">
  New panel
</div>

// Pulse ring (for active indicators)
<div className="animate-pulse-ring">
  Active indicator
</div>
```

### Custom Animation Example
```jsx
// Reaction animation
const handleReaction = (emoji) => {
  const id = `reaction_${Date.now()}`
  const randomX = Math.random() * 80 + 10
  const randomY = Math.random() * 40 + 20

  setReactions(prev => [...prev, { 
    id, 
    emoji, 
    position: { x: randomX, y: randomY } 
  }])

  // Remove after animation
  setTimeout(() => {
    setReactions(prev => prev.filter(r => r.id !== id))
  }, 2000)
}

// In JSX
{reactions.map(reaction => (
  <div
    key={reaction.id}
    className="absolute text-4xl font-bold animate-float-up"
    style={{
      left: `${reaction.position.x}%`,
      top: `${reaction.position.y}%`,
    }}
  >
    {reaction.emoji}
  </div>
))}
```

---

## Common UI Patterns

### Button Variants
```jsx
// Primary action (default)
<Button>Add to Cart</Button>

// Secondary action
<Button variant="secondary">Save for Later</Button>

// Outline button
<Button variant="outline">Learn More</Button>

// Ghost button (minimal)
<Button variant="ghost">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Link button
<Button variant="link">More info</Button>
```

### Card Layout
```jsx
<Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-shadow">
  <div className="relative">
    <img src="" alt="" className="w-full h-48 object-cover" />
    <Badge className="absolute top-3 left-3">New</Badge>
  </div>
  
  <CardContent className="p-4">
    <h3 className="font-bold text-foreground mb-2">Title</h3>
    <p className="text-sm text-muted-foreground mb-4">Description</p>
    <Button className="w-full">Action</Button>
  </CardContent>
</Card>
```

### Modal/Dialog Pattern
```jsx
import { AlertDialog, AlertDialogTrigger, AlertDialogContent } from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Open</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <h2 className="text-lg font-bold">Confirm Action</h2>
    <p className="text-muted-foreground">Are you sure?</p>
    <div className="flex gap-2 justify-end">
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </AlertDialogContent>
</AlertDialog>
```

---

## Accessibility Checklist

When building new components:

- [ ] All interactive elements are keyboard accessible (Tab key)
- [ ] Focus states are visible (blue ring)
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Touch targets are at least 44x44px
- [ ] Images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Semantic HTML is used (headings, nav, main, etc.)
- [ ] ARIA attributes are used when needed
- [ ] Animations respect `prefers-reduced-motion`

### Testing Accessibility
```bash
# Install Axe DevTools Chrome Extension
# Test with built-in color contrast checker
# Test keyboard navigation (Tab, Enter, Escape)
# Test with screen reader (NVDA, JAWS, or Safari VoiceOver)
```

---

## Performance Tips

### Image Optimization
```jsx
// Use next/image for optimization
import Image from "next/image"

<Image
  src="/product.jpg"
  alt="Product name"
  width={400}
  height={300}
  priority={false} // Set true for above-fold images
  loading="lazy"
/>
```

### Avoiding Layout Shift
```jsx
// Reserve space for images with aspect ratio
<div className="aspect-video bg-muted">
  <img src="" alt="" className="w-full h-full object-cover" />
</div>

// Use aspect-square, aspect-video, etc.
<div className="aspect-square">
  <img src="" alt="" />
</div>
```

### Efficient CSS
```jsx
// Use gap instead of margin between items
<div className="flex gap-4">  ✅ Good
<div className="flex">       ❌ Avoid
  <div className="mr-4">    (more verbose)

// Use semantic tokens instead of hardcoded colors
<button className="bg-primary">      ✅ Good
<button className="bg-blue-500">    ❌ Avoid
```

---

## Troubleshooting

### Colors Not Showing Correctly
- Check if dark mode is enabled (`dark` class on `<html>`)
- Verify design tokens in `app/globals.css`
- Clear browser cache

### Responsive Layout Not Working
- Check viewport meta tag in layout
- Verify screen size breakpoints (sm: 640px, lg: 1024px)
- Use browser DevTools responsive mode

### Animations Not Playing
- Check if animations are enabled in browser
- Verify animation classes are applied
- Check for `animation: none` overrides

### Touch Issues on Mobile
- Ensure buttons are at least 44px (h-11 or larger)
- Add padding to make interactive area larger
- Test on actual mobile device

---

## Code Examples

### Complete Product Showcase Section
```jsx
"use client"

import { useState } from "react"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export default function ProductShowcase() {
  const [selectedProduct, setSelectedProduct] = useState(null)

  const products = [
    {
      id: 1,
      name: "Product 1",
      price: 45,
      originalPrice: 65,
      image: "/product1.jpg",
      stock: 12,
      rating: 4.8,
      reviews: 234,
      trending: true,
    },
    // ... more products
  ]

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Featured Products
          </h2>
          <Button variant="link" className="text-primary">
            See all
            <ChevronDown className="w-4 h-4 rotate-90" />
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              {...product}
              onSelect={setSelectedProduct}
              onAddToCart={(p) => console.log("Added:", p)}
            />
          ))}
        </div>

        {/* Selected Product Details */}
        {selectedProduct && (
          <div className="mt-8 p-6 bg-card rounded-xl border border-border">
            <h3 className="text-xl font-bold mb-4">
              {selectedProduct.name}
            </h3>
            <p className="text-muted-foreground">
              Selected product details here...
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
```

---

## Resources

- **Design System**: See `DESIGN_SYSTEM.md`
- **Implementation Details**: See `LIVE_SHOPPING_IMPROVEMENTS.md`
- **UI Summary**: See `UI_IMPROVEMENTS_SUMMARY.md`
- **Tailwind Docs**: https://tailwindcss.com
- **Radix UI Docs**: https://radix-ui.com
- **WCAG Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Getting Help

If you need help with:
- **Design questions**: Check `DESIGN_SYSTEM.md`
- **Component usage**: Check component JSDoc comments
- **Accessibility**: Check `DEVELOPER_GUIDE.md` accessibility section
- **Performance**: Check performance tips section above

---

**Happy coding! 🚀**
