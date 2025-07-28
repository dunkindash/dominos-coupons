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
    <header className="bg-white shadow-sm border-b border-gray-200 mb-6 sm:mb-8">
      <div className="dominos-container py-4 sm:py-6 md:py-8">
        <div className="text-center">
          {showLogo && (
            <div className="mb-3 sm:mb-4">
              {/* Placeholder for Domino's logo - would be replaced with actual logo */}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-dominos-red rounded-full mb-2">
                <span className="text-white font-bold text-lg sm:text-xl">D</span>
              </div>
            </div>
          )}
          
          <h1 className="dominos-heading-xl text-gray-900 mb-2 sm:mb-3 px-4">
            {displayTitle}
          </h1>
          
          <p className="dominos-subheading text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4">
            {subtitle}
          </p>
          
          {/* Value proposition highlights */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center text-sm text-gray-600 px-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-red rounded-full flex-shrink-0"></div>
              <span>Real-time deals</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-blue rounded-full flex-shrink-0"></div>
              <span>Store-specific offers</span>
            </div>
            <div className="hidden sm:block text-gray-300">•</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-dominos-red rounded-full flex-shrink-0"></div>
              <span>Easy to use</span>
            </div>
          </div>
          
          {showNavigation && (
            <nav className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
              <div className="flex flex-col xs:flex-row justify-center gap-4 xs:gap-6">
                <button className="text-dominos-blue hover:text-dominos-red active:text-dominos-red transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-gray-50 touch-manipulation">
                  Find Stores
                </button>
                <button className="text-dominos-blue hover:text-dominos-red active:text-dominos-red transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-gray-50 touch-manipulation">
                  View Deals
                </button>
                <button className="text-dominos-blue hover:text-dominos-red active:text-dominos-red transition-colors duration-200 font-medium py-2 px-4 rounded-md hover:bg-gray-50 touch-manipulation">
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