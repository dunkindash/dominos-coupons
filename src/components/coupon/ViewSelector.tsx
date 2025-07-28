import { memo } from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ViewSelectorProps {
  currentView: 'grid' | 'list'
  onViewChange: (view: 'grid' | 'list') => void
  couponCount: number
  className?: string
}

// Grid and List icons as SVG components for better control
const GridIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("w-4 h-4", className)} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" 
    />
  </svg>
)

const ListIcon = ({ className }: { className?: string }) => (
  <svg 
    className={cn("w-4 h-4", className)} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M4 6h16M4 10h16M4 14h16M4 18h16" 
    />
  </svg>
)

export const ViewSelector = memo(function ViewSelector({ 
  currentView, 
  onViewChange, 
  couponCount, 
  className 
}: ViewSelectorProps) {
  const handleViewChange = (newView: 'grid' | 'list') => {
    // Add a small delay to allow for smooth transition
    if (newView !== currentView) {
      onViewChange(newView)
    }
  }

  return (
    <div className={cn(
      "flex items-center justify-between gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200",
      className
    )}>
      {/* Coupon count and description */}
      <div className="flex-1 min-w-0">
        <h3 
          id="coupon-count-heading"
          className="dominos-heading-sm text-dominos-red mb-1 transition-colors duration-200"
        >
          🎟️ {couponCount} {couponCount === 1 ? 'Coupon' : 'Coupons'} Available
        </h3>
        <p className="dominos-caption hidden sm:block text-gray-600">
          Choose your preferred view to browse deals • Currently viewing: <span className="font-medium text-dominos-red">{currentView === 'grid' ? 'Grid' : 'List'}</span>
        </p>
      </div>

      {/* View toggle buttons */}
      <div 
        className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg transition-all duration-200"
        role="group"
        aria-labelledby="coupon-count-heading"
        aria-label="Choose coupon display view"
      >
        <Button
          variant={currentView === 'grid' ? 'dominos-primary' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('grid')}
          className={cn(
            "h-8 px-3 transition-all duration-300 touch-manipulation transform",
            currentView === 'grid' 
              ? "bg-dominos-red text-white shadow-sm scale-105" 
              : "text-gray-600 hover:text-dominos-red hover:bg-white hover:scale-105"
          )}
          aria-label={`Switch to grid view${currentView === 'grid' ? ' (currently selected)' : ''}`}
          aria-pressed={currentView === 'grid'}
          type="button"
        >
          <GridIcon className={cn(
            "transition-all duration-300",
            currentView === 'grid' ? "text-white scale-110" : "text-current"
          )} />
          <span className="hidden xs:inline ml-1 transition-all duration-200">Grid</span>
        </Button>

        <Button
          variant={currentView === 'list' ? 'dominos-primary' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('list')}
          className={cn(
            "h-8 px-3 transition-all duration-300 touch-manipulation transform",
            currentView === 'list' 
              ? "bg-dominos-red text-white shadow-sm scale-105" 
              : "text-gray-600 hover:text-dominos-red hover:bg-white hover:scale-105"
          )}
          aria-label={`Switch to list view${currentView === 'list' ? ' (currently selected)' : ''}`}
          aria-pressed={currentView === 'list'}
          type="button"
        >
          <ListIcon className={cn(
            "transition-all duration-300",
            currentView === 'list' ? "text-white scale-110" : "text-current"
          )} />
          <span className="hidden xs:inline ml-1 transition-all duration-200">List</span>
        </Button>
      </div>
    </div>
  )
})

export default ViewSelector