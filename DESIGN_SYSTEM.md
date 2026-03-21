# Live Shopping Platform - Design System

## Overview

This document outlines the comprehensive design system for the live shopping platform, built with a mobile-first approach that seamlessly adapts to larger screens.

## Color Palette

The platform uses a modern, vibrant color scheme optimized for engagement and conversion:

### Primary Colors
- **Primary (Teal-Blue)**: `hsl(195 100% 50%)` - Main brand color for CTAs and interactive elements
- **Secondary (Coral)**: `hsl(15 100% 58%)` - Accent color for highlights and complementary actions
- **Foreground**: `hsl(0 0% 8%)` - Text color on light backgrounds
- **Background**: `hsl(0 0% 98%)` - Main light background

### Dark Mode
- **Dark Background**: `hsl(0 0% 6%)` - Deep charcoal for dark mode
- **Dark Foreground**: `hsl(0 0% 96%)` - Light text on dark backgrounds

### Supporting Colors
- **Border**: `hsl(0 0% 88%)` - Subtle divider lines
- **Muted**: `hsl(0 0% 92%)` - Secondary background elements
- **Card**: `hsl(0 0% 100%)` - Card backgrounds

## Typography

- **Font Family**: Geist (sans-serif) - Clean, modern, highly readable
- **Heading Weights**: Bold (700) for h1-h3, Semibold (600) for smaller headings
- **Body Weight**: Regular (400) for content, Semibold (600) for emphasis
- **Line Height**: 1.5 (leading-relaxed) for optimal readability

## Component Patterns

### Buttons
- **Default**: Primary color with shadow on hover
- **Secondary**: Coral accent with shadow on hover
- **Outline**: Bordered buttons with subtle hover state
- **Ghost**: Minimal styling, hover background only
- **Border Radius**: 0.75rem (lg) for modern, rounded appearance

### Cards
- **Shadows**: Progressive hover shadows (md to 2xl)
- **Borders**: None by default, subtle border on interactive elements
- **Transitions**: 300ms ease-out for smooth interactions
- **Padding**: 1rem (p-4) standard padding

### Interactive Elements
- **Hover States**: Scale transform (105%), shadow increase, color transitions
- **Active States**: Scale down (95%) with reduced opacity
- **Transitions**: All 200-300ms for smooth feel
- **Feedback**: Visual feedback on all interactive elements

## Mobile-First Layout Strategy

### Grid System
```
Mobile (default): 1 column
Tablet (sm): 2 columns  
Desktop (lg): 3+ columns
```

### Responsive Spacing
- **Mobile**: Condensed spacing (gap-3 to gap-4)
- **Tablet**: Medium spacing (gap-4 to gap-6)
- **Desktop**: Generous spacing (gap-6 to gap-8)

### Navigation
- **Mobile**: Bottom navigation, collapsible menus
- **Desktop**: Top navigation with visible menu items

## Key Design Features

### Live Stream Interface
1. **Video Player**: Full width on mobile, maintains aspect ratio
2. **Floating Reactions**: Emojis float up on screen with animation
3. **Quick Reaction Buttons**: Hover reveal on desktop, always visible on mobile
4. **Featured Product Spotlight**: Overlaid on video with direct purchase option

### Product Showcase
- **Hover Effects**: Scale up, shadow increase, overlay
- **Badge System**: Discount percentage, trending indicator, stock status
- **Rating Display**: Star icon with numerical rating and review count
- **Add to Cart**: Primary action button with shopping bag icon

### Live Chat
- **Message Styling**: Role-based background colors (host red, moderator blue)
- **Timestamp**: Hidden by default, visible on hover
- **Like Reactions**: Heart icon with count
- **Auto-scroll**: Messages auto-scroll to latest

### Active Viewers
- **Status Indicator**: Green dot for online status
- **Role Badges**: Host (🎤) and Moderator (⭐) indicators
- **Following Indicator**: Highlighted in primary color
- **Avatars**: Gradient backgrounds with initials

## Animation Keyframes

### Float Up Animation
Reactions float upward and fade out over 2 seconds:
```css
@keyframes float-up {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-100px) scale(0.5); }
}
```

### Fade In Animation
Messages fade in with slight upward movement:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

## Accessibility Features

1. **Color Contrast**: All text meets WCAG AA standards
2. **Interactive Elements**: Min 44px touch target (mobile)
3. **ARIA Labels**: Proper labels for screen readers
4. **Keyboard Navigation**: Tab order properly managed
5. **Focus States**: Visible focus rings on all interactive elements

## Implementation Guidelines

### Using Design Tokens
```jsx
// ✅ Use semantic tokens
<div className="bg-background text-foreground">
<button className="bg-primary text-primary-foreground">
```

```jsx
// ❌ Avoid direct colors
<div className="bg-white text-black">
<button className="bg-blue-500">
```

### Responsive Patterns
```jsx
// Mobile-first approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
<button className="w-full sm:w-auto">
<img className="h-40 sm:h-48 lg:h-56">
```

### Shadow Hierarchy
- **sm**: Subtle cards and panels
- **md**: Elevated interactive elements
- **lg**: Modal overlays
- **2xl**: Prominent hover states

## Live Shopping Best Practices

### Product Display
1. High-quality product images (16:10 aspect ratio)
2. Clear pricing with original price crossed out
3. Stock indicators for urgency
4. Real-time rating and review counts

### User Engagement
1. Visible viewer count creates FOMO
2. Floating reactions show real-time engagement
3. Quick reactions reduce friction
4. Live chat creates community

### Conversion Optimization
1. Prominent "Add to Cart" buttons (secondary color)
2. Quick purchase from video player
3. Product rating and reviews visible
4. Stock status drives urgency

## Future Enhancements

- [ ] Dark mode theme refinement
- [ ] Advanced product filtering
- [ ] Wishlist functionality
- [ ] Social sharing integration
- [ ] Advanced analytics dashboard
- [ ] Multi-stream support
- [ ] Payment integration
