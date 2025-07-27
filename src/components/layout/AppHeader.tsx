import { memo } from 'react'

interface AppHeaderProps {
  title?: string
  subtitle?: string
}

export const AppHeader = memo(function AppHeader({ 
  title = "Domino's Coupons Finder",
  subtitle = "Find the best deals at your local Domino's store"
}: AppHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-blue-100 mb-2">
        {title}
      </h1>
      <p className="text-blue-100">
        {subtitle}
      </p>
    </div>
  )
})

export default AppHeader