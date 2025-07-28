import { memo } from 'react'

interface EnhancedHeaderProps {
  title?: string
  subtitle?: string
  showLogo?: boolean
  customTitle?: string
  showNavigation?: boolean
}

export const EnhancedHeader = memo(function EnhancedHeader({ 
  title = "Find Domino's Deals & Coupons",
  subtitle = "Discover the best deals and exclusive offers at your local Domino's store",
  showLogo = false,
  customTitle,
  showNavigation = false
}: EnhancedHeaderProps) {
  const displayTitle = customTitle || title

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="dominos-container py-6 md:py-8">
        <div className="text-center">
          {showLogo && (
            <div className="mb-4">
              {/* Placeholder for Domino's logo - would be replaced with actual logo */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-dominos-red rounded-full mb-2">
                <span className="text-white font-bold text-xl">D</span>
              </div>
            </div>
          )}
          
          <h1 className="dominos-heading-xl text-gray-900 mb-3">
            {displayTitle}
          </h1>
          
          <p className="dominos-subheading text-lg md:text-xl max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          {/* Value proposition highlights */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-red rounded-full"></div>
              <span>Real-time deals</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-blue rounded-full"></div>
              <span>Store-specific offers</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-red rounded-full"></div>
              <span>Easy to use</span>
            </div>
          </div>
          
          {showNavigation && (
            <nav className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-center space-x-6">
                <button className="text-dominos-blue hover:text-dominos-red transition-colors duration-200 font-medium">
                  Find Stores
                </button>
                <button className="text-dominos-blue hover:text-dominos-red transition-colors duration-200 font-medium">
                  View Deals
                </button>
                <button className="text-dominos-blue hover:text-dominos-red transition-colors duration-200 font-medium">
                  Help
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
})

export default EnhancedHeader