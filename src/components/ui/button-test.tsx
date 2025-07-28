import { Button } from "./button"

// Test component to verify Domino's button variants work correctly
export function ButtonTest() {
  return (
    <div className="p-8 space-y-4 bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Domino's Button Variants Test</h2>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Primary Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="dominos-primary">Domino's Primary</Button>
          <Button variant="dominos-primary" size="sm">Small Primary</Button>
          <Button variant="dominos-primary" size="lg">Large Primary</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Secondary Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="dominos-secondary">Domino's Secondary</Button>
          <Button variant="dominos-secondary" size="sm">Small Secondary</Button>
          <Button variant="dominos-secondary" size="lg">Large Secondary</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Accent Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="dominos-accent">Domino's Accent</Button>
          <Button variant="dominos-accent" size="sm">Small Accent</Button>
          <Button variant="dominos-accent" size="lg">Large Accent</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Ghost Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button variant="dominos-ghost">Red Ghost</Button>
          <Button variant="dominos-blue-ghost">Blue Ghost</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Typography Classes</h3>
        <div className="space-y-2">
          <h1 className="dominos-heading-xl">Extra Large Heading</h1>
          <h2 className="dominos-heading-lg">Large Heading</h2>
          <h3 className="dominos-heading-md">Medium Heading</h3>
          <h4 className="dominos-heading-sm">Small Heading</h4>
          <p className="dominos-subheading">This is a subheading with proper styling</p>
          <p className="dominos-body">This is body text with proper line height and color</p>
          <p className="dominos-caption">This is caption text for smaller details</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold">Brand Colors</h3>
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-dominos-red rounded flex items-center justify-center text-white text-xs">Red</div>
          <div className="w-16 h-16 bg-dominos-blue rounded flex items-center justify-center text-white text-xs">Blue</div>
        </div>
      </div>
    </div>
  )
}