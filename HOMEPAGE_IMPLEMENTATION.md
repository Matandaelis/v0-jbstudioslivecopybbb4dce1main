# Homepage Implementation Guide

## Quick Start

The new live shopping homepage is located at `/app/page.tsx` and serves as the main entry point for all visitors.

## Architecture

### Main Component Structure

\`\`\`typescript
HomePage Component
├── Hero Section (Hero content + visual)
├── Streaming Now (Live streams grid)
├── Shop by Category (Category navigation)
├── Upcoming Events (Countdown timers)
├── Real-Time Interaction Preview (Chat showcase)
├── Trust & Social Proof (Metrics)
└── CTA Section (Final conversion point)
\`\`\`

### Key Features

#### 1. Dynamic Countdown Timer
Real-time countdown timer that updates every second for upcoming events.

\`\`\`typescript
useEffect(() => {
  const updateCountdowns = () => {
    // Calculates time remaining for each event
    const diff = event.startTime.getTime() - Date.now()
    // Updates state with days, hours, minutes, seconds
  }
  
  updateCountdowns()
  const interval = setInterval(updateCountdowns, 1000)
  return () => clearInterval(interval)
}, [])
\`\`\`

**Usage:**
- Automatically calculates and displays time remaining
- Updates every second without page refresh
- Handles timezone-aware calculations

#### 2. Category Selection
Interactive category buttons with visual feedback.

\`\`\`typescript
const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

// Toggle category on click
onClick={() => setSelectedCategory(isSelected ? null : category.name)}
\`\`\`

**Behavior:**
- Click to select/deselect category
- Visual indication of selected state
- No page reload required

#### 3. Animated Background
Multiple CSS animations create visual depth and engagement.

**Animations Used:**
- `animate-float-up`: Floating blob shapes
- `animate-fade-in`: Content fade-in
- `animate-slide-in`: Side content slide
- `animate-pulse-ring`: Live indicator pulse

### Data Structure

#### LIVE_STREAMS Array
\`\`\`typescript
interface LiveStream {
  id: number
  title: string
  host: string
  viewers: number
  thumbnail: string
  isLive: boolean
  products: number
  discount: number
}
\`\`\`

#### UPCOMING_EVENTS Array
\`\`\`typescript
interface UpcomingEvent {
  id: number
  title: string
  host: string
  startTime: Date
  image: string
}
\`\`\`

#### CATEGORIES Array
\`\`\`typescript
interface Category {
  name: string
  icon: React.ComponentType
  color: string // Gradient class
}
\`\`\`

## Design System Integration

### Colors Used
- **Primary (Teal)**: CTAs, highlights, badges
- **Secondary (Coral)**: Discount badges, accent highlights
- **Background**: Main page background
- **Foreground**: Text color
- **Muted**: Subtle backgrounds and secondary text

### Typography
- **Headlines**: Font-bold, responsive sizing
- **Body**: Standard weight, 16px base
- **Small**: 14px for metadata and secondary info

### Spacing
- Uses Tailwind spacing scale (p-4, gap-6, py-16, etc.)
- Responsive padding (md:px-6 for tablets/desktop)

## Component Integration

### Used UI Components
- `Button` - All actionable elements
- `Card` - Stream and event containers
- `Badge` - Status and category indicators
- `Navigation` - Header navigation
- `Footer` - Site footer

### Icons Used (from lucide-react)
- `Play` - Watch/stream buttons
- `Zap` - Energy/lightning themes
- `Users` - Viewer count
- `TrendingUp` - Trending content
- `Heart` - Favorites/likes
- `MessageCircle` - Chat
- `Clock` - Countdown timers
- `ShoppingBag` - Products
- `Sparkles` - Beauty category
- `Flame` - Hot/trending
- `Eye` - View count
- `ChevronRight` - Next/more

## Customization Guide

### Changing Hero Content
Edit the hero section in `HomePage` component:

\`\`\`typescript
// Hero headline
<h1>Shop Live,<span>Shop Together</span></h1>

// Description
<p>Experience the future of shopping...</p>

// CTA buttons
<Button>Start Shopping Live</Button>
\`\`\`

### Adding/Editing Live Streams
Modify the `LIVE_STREAMS` constant:

\`\`\`typescript
const LIVE_STREAMS = [
  {
    id: 1,
    title: "Your Title Here",
    host: "Creator Name",
    viewers: 2400,
    thumbnail: "/path/to/image.jpg",
    isLive: true,
    products: 12,
    discount: 30,
  },
  // ... more streams
]
\`\`\`

### Updating Categories
Edit `CATEGORIES` array:

\`\`\`typescript
const CATEGORIES = [
  { 
    name: "New Category",
    icon: YourIcon,
    color: "from-color-1 to-color-2"
  },
]
\`\`\`

### Modifying Upcoming Events
Update `UPCOMING_EVENTS` with new dates:

\`\`\`typescript
const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Event Title",
    host: "Creator Name",
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    image: "/path/to/image.jpg",
  },
]
\`\`\`

## Performance Optimization

### Current Optimizations
1. **CSS Animations**: GPU-accelerated, no JavaScript overhead
2. **Efficient State**: Only `countdowns` and `selectedCategory` state
3. **No External APIs**: All data is static/mock data
4. **Lazy Images**: Using Next.js Image optimization
5. **Code Splitting**: Component-based organization

### Future Optimization Opportunities
1. **Image Optimization**: Convert thumbnails to WebP
2. **Lazy Loading**: Intersection Observer for off-screen sections
3. **Code Splitting**: Dynamic imports for below-fold content
4. **Caching**: Static data caching with SWR or React Query
5. **CDN**: Serve images from CDN for faster delivery

## Mobile Responsiveness

### Breakpoints Used
- **Mobile**: Default styles (< 768px)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+)

### Mobile-First Approach
1. Design starts with mobile layout
2. `md:` classes add tablet enhancements
3. `lg:` classes add desktop optimizations

### Responsive Elements
- **Hero**: Full-width on mobile, split layout on desktop
- **Streams Grid**: 1 column mobile → 2 columns tablet → 3 columns desktop
- **Categories**: 2x2 grid mobile → 4x1 grid desktop
- **Chat Preview**: Stacked mobile → side-by-side desktop

## Accessibility Features

### Keyboard Navigation
- All buttons are keyboard focusable
- Tab order follows visual flow
- Enter key activates buttons

### Screen Reader Support
- Semantic HTML (h1, h2, p tags)
- Alt text on all images
- ARIA labels on icons
- Descriptive button text

### Color Contrast
- All text meets WCAG AA standards
- No information conveyed by color alone
- High contrast between elements

## SEO Optimization

### Meta Tags
\`\`\`typescript
export const metadata: Metadata = {
  title: "Shop Live, Shop Together | Live Shopping Platform",
  description: "Experience the future of shopping with live streaming deals...",
}
\`\`\`

### Structured Content
- Proper heading hierarchy (H1 → H2 → H3)
- Descriptive alt text on images
- Semantic HTML elements
- Open Graph ready (can be added)

## Testing Checklist

### Functionality
- [ ] Countdown timer updates correctly
- [ ] Category selection toggles properly
- [ ] All links navigate correctly
- [ ] Buttons have proper hover states
- [ ] Animations play smoothly

### Responsive Design
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Touch interactions work on mobile
- [ ] Text is readable at all sizes

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader reads content
- [ ] Color contrast meets standards
- [ ] Focus indicators are visible
- [ ] Form inputs are labeled

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Animations are smooth (60fps)
- [ ] No console errors
- [ ] Images load properly
- [ ] Network requests are minimal

## Deployment Notes

### Pre-deployment Checklist
1. Replace mock images with real assets
2. Update live stream data with real data
3. Add real upcoming event dates
4. Update creator names and titles
5. Verify all links point to correct routes
6. Test on production URL
7. Check SEO meta tags

### Environment Setup
No special environment variables required for the homepage.

### Build Process
\`\`\`bash
npm install
npm run build
npm run start
\`\`\`

## Troubleshooting

### Countdown Timer Not Updating
**Issue**: Timer shows but doesn't decrement
**Solution**: Check browser console for errors, verify Date is valid

### Animations Not Playing
**Issue**: Smooth animations appear choppy
**Solution**: Check browser GPU acceleration, test in different browser

### Responsive Layout Broken
**Issue**: Layout breaks at certain screen sizes
**Solution**: Use browser DevTools to check Tailwind breakpoints

### Images Not Loading
**Issue**: Images show as 404 or broken
**Solution**: Verify image paths, check public folder, use correct extensions

## Code Examples

### Adding a New Section
\`\`\`typescript
<section className="py-16 md:py-24 bg-white dark:bg-black/20">
  <div className="max-w-7xl mx-auto px-4 md:px-6">
    {/* Content here */}
  </div>
</section>
\`\`\`

### Creating Interactive Element
\`\`\`typescript
const [state, setState] = useState(false)

return (
  <button onClick={() => setState(!state)}>
    {state ? "Active" : "Inactive"}
  </button>
)
\`\`\`

### Using Icons
\`\`\`typescript
import { Play, Heart } from "lucide-react"

<Play className="w-5 h-5 mr-2" />
<Heart className="w-4 h-4" />
\`\`\`

## Next Steps

1. **Connect Real Data**: Replace mock data with API calls
2. **Add Analytics**: Implement tracking for user interactions
3. **Personalization**: Show custom content based on user preferences
4. **Search**: Add search functionality
5. **User Accounts**: Implement login and saved preferences

## Support

For questions or issues with the homepage:
1. Check this guide
2. Review the HOMEPAGE_FEATURES.md file
3. Check the DESIGN_SYSTEM.md file
4. Review component source code
5. Check browser console for errors
