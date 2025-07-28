# Design Document

## Overview

The redesigned interface will transform the current blue-background layout into a modern, Domino's-branded experience that closely mirrors the official Domino's website design patterns. The new design will feature a clean white background with strategic use of Domino's red and blue colors, improved visual hierarchy, and a more intuitive user flow that guides users from store selection to coupon discovery.

## Architecture

### Design System Foundation

The redesign will build upon the existing shadcn/ui component system while introducing Domino's-specific design tokens and patterns:

- **Color Palette**: Primary use of Domino's red (#e61838) for CTAs and important actions, Domino's blue (#016593) for secondary elements and accents
- **Typography**: Enhanced hierarchy with bold headings and clear content separation
- **Layout**: Card-based design with generous white space and clear visual groupings
- **Spacing**: Consistent 8px grid system for predictable layouts

### Layout Structure

The new layout will follow a progressive disclosure pattern:

1. **Hero Section**: Prominent header with clear value proposition
2. **Search Interface**: Unified search experience with tabbed options
3. **Results Display**: Clean, organized presentation of stores and coupons
4. **Action Areas**: Contextual actions like email functionality

## Components and Interfaces

### 1. Enhanced Header Component

**Purpose**: Create a more prominent, branded header that establishes trust and clarity

**Design Specifications**:
- White background with subtle shadow
- Domino's logo placement (or branded typography)
- Clear headline: "Find Domino's Deals & Coupons"
- Subtitle explaining the service value
- Consistent with Domino's website header patterns

**Interface**:
```typescript
interface EnhancedHeaderProps {
  showLogo?: boolean
  customTitle?: string
  showNavigation?: boolean
}
```

### 2. Unified Search Component

**Purpose**: Combine store number search and location search into a cohesive interface

**Design Specifications**:
- Tabbed interface: "Store Number" and "Find Nearby"
- Large, prominent search inputs with Domino's styling
- Clear labels and helper text
- Primary red CTA buttons
- Language selector integrated naturally

**Interface**:
```typescript
interface UnifiedSearchProps {
  onStoreSelect: (storeId: string) => void
  onRateLimitUpdate: (count: number, time: number | null) => void
  currentLanguage: string
  onLanguageChange: (lang: string) => void
}
```

### 3. Store Results Component

**Purpose**: Display store search results in an organized, scannable format

**Design Specifications**:
- Card-based layout with store information
- Clear hierarchy: store name, address, distance
- "View Deals" CTA buttons in Domino's red
- Store status indicators (open/closed)
- Responsive grid layout

**Interface**:
```typescript
interface StoreResultsProps {
  stores: StoreInfo[]
  onStoreSelect: (storeId: string) => void
  loading?: boolean
}
```

### 4. Enhanced Coupon Grid

**Purpose**: Present coupons in a visually appealing, organized manner

**Design Specifications**:
- Grid layout with consistent card sizing
- Visual hierarchy: savings amount, description, restrictions
- Color-coded categories or deal types
- Hover effects and interaction feedback
- Mobile-responsive stacking

**Interface**:
```typescript
interface EnhancedCouponGridProps {
  coupons: ProcessedCoupon[]
  onCouponSelect?: (coupon: ProcessedCoupon) => void
  viewMode?: 'grid' | 'list'
}
```

### 5. Branded Button System

**Purpose**: Create button variants that match Domino's brand guidelines

**Design Specifications**:
- Primary: Domino's red background with white text
- Secondary: White background with red border and red text
- Accent: Domino's blue for secondary actions
- Consistent hover states and transitions
- Proper sizing for touch interfaces

**Interface**:
```typescript
interface BrandedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'accent' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
}
```

### 6. Contextual Action Bar

**Purpose**: Provide easy access to actions like emailing coupons

**Design Specifications**:
- Sticky positioning when coupons are visible
- Clean white background with subtle shadow
- Clear action buttons with icons
- Responsive behavior for mobile

**Interface**:
```typescript
interface ActionBarProps {
  visible: boolean
  couponCount: number
  onEmailCoupons: () => void
  onShareCoupons?: () => void
}
```

## Data Models

### Enhanced Store Information

```typescript
interface EnhancedStoreInfo extends StoreInfo {
  displayName: string
  formattedAddress: string
  distance?: string
  isOpen: boolean
  businessHours?: string
}
```

### Processed Coupon with Display Data

```typescript
interface ProcessedCouponDisplay extends ProcessedCoupon {
  displayCategory: string
  savingsHighlight: string
  restrictionsSummary: string
  visualPriority: 'high' | 'medium' | 'low'
}
```

### UI State Management

```typescript
interface UIState {
  searchMode: 'store-number' | 'location'
  currentView: 'search' | 'results' | 'coupons'
  selectedStore: EnhancedStoreInfo | null
  viewMode: 'grid' | 'list'
}
```

## Error Handling

### User-Friendly Error States

1. **Network Errors**: Clear messaging with retry options
2. **No Results**: Helpful suggestions and alternative actions
3. **Rate Limiting**: Clear explanation with countdown timer
4. **Invalid Store**: Guidance on finding correct store numbers

### Error Component Design

- Consistent with overall design system
- Clear iconography and messaging
- Actionable next steps
- Branded colors for different error types

## Testing Strategy

### Visual Regression Testing

1. **Component Screenshots**: Automated visual testing for all new components
2. **Responsive Testing**: Verify layouts across device sizes
3. **Brand Compliance**: Ensure color usage matches specifications

### User Experience Testing

1. **Flow Testing**: Verify the complete user journey from search to coupon viewing
2. **Accessibility Testing**: Ensure WCAG compliance with screen readers and keyboard navigation
3. **Performance Testing**: Measure load times and interaction responsiveness

### Integration Testing

1. **API Integration**: Verify all existing API endpoints work with new UI
2. **State Management**: Test state transitions between different views
3. **Error Scenarios**: Validate error handling across all components

## Implementation Phases

### Phase 1: Foundation
- Update color system and design tokens
- Create branded button variants
- Implement enhanced header

### Phase 2: Search Experience
- Build unified search component
- Implement tabbed interface
- Integrate store finder improvements

### Phase 3: Results Display
- Create enhanced coupon grid
- Implement store results component
- Add contextual action bar

### Phase 4: Polish & Optimization
- Responsive refinements
- Animation and transition improvements
- Performance optimizations

## Accessibility Considerations

- **Color Contrast**: Ensure all text meets WCAG AA standards
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

## Performance Considerations

- **Lazy Loading**: Implement for coupon images and non-critical components
- **Code Splitting**: Separate design system components for optimal loading
- **Image Optimization**: Compress and optimize any new brand assets
- **Bundle Size**: Monitor impact of design changes on overall bundle size