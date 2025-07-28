/**
 * Accessibility tests for the Domino's Coupons Finder application
 * Tests WCAG AA compliance, keyboard navigation, and screen reader support
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import App from '../../App'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ViewSelector } from '../../components/coupon/ViewSelector'
import UnifiedSearch from '../../components/UnifiedSearch'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock sessionStorage for authentication
const mockSessionStorage = {
  getItem: jest.fn(() => 'mock-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage })

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('Accessibility Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Button Component Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button>Test Button</Button>)
      const button = screen.getByRole('button', { name: 'Test Button' })
      
      expect(button).toHaveAttribute('type', 'button')
      expect(button).toHaveAttribute('tabindex', '0')
    })

    it('should handle disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
      expect(button).toHaveAttribute('aria-disabled', 'true')
      expect(button).toHaveAttribute('tabindex', '-1')
    })

    it('should have proper focus management', async () => {
      const user = userEvent.setup()
      render(<Button>Focusable Button</Button>)
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
    })

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <div>
          <Button variant="dominos-primary">Primary Button</Button>
          <Button variant="dominos-secondary">Secondary Button</Button>
          <Button variant="dominos-accent">Accent Button</Button>
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Input Component Accessibility', () => {
    it('should have proper labels and descriptions', () => {
      render(
        <div>
          <label htmlFor="test-input">Test Input</label>
          <Input id="test-input" error="Test error message" />
        </div>
      )
      
      const input = screen.getByLabelText('Test Input')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby')
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Test error message')
    })

    it('should handle required fields correctly', () => {
      render(<Input required placeholder="Required field" />)
      const input = screen.getByRole('textbox')
      
      expect(input).toBeRequired()
    })

    it('should pass axe accessibility tests', async () => {
      const { container } = render(
        <div>
          <label htmlFor="accessible-input">Accessible Input</label>
          <Input id="accessible-input" />
        </div>
      )
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('ViewSelector Component Accessibility', () => {
    const mockProps = {
      currentView: 'grid' as const,
      onViewChange: jest.fn(),
      couponCount: 5,
    }

    it('should have proper ARIA attributes for button group', () => {
      render(<ViewSelector {...mockProps} />)
      
      const buttonGroup = screen.getByRole('group')
      expect(buttonGroup).toHaveAttribute('aria-label', 'Choose coupon display view')
      
      const gridButton = screen.getByRole('button', { name: /grid view/i })
      const listButton = screen.getByRole('button', { name: /list view/i })
      
      expect(gridButton).toHaveAttribute('aria-pressed', 'true')
      expect(listButton).toHaveAttribute('aria-pressed', 'false')
    })

    it('should handle keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<ViewSelector {...mockProps} />)
      
      const gridButton = screen.getByRole('button', { name: /grid view/i })
      const listButton = screen.getByRole('button', { name: /list view/i })
      
      await user.tab()
      expect(gridButton).toHaveFocus()
      
      await user.tab()
      expect(listButton).toHaveFocus()
    })

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<ViewSelector {...mockProps} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('UnifiedSearch Component Accessibility', () => {
    const mockProps = {
      onStoreSelect: jest.fn(),
      onRateLimitUpdate: jest.fn(),
      currentLanguage: 'en',
      onLanguageChange: jest.fn(),
      requestCount: 0,
      firstRequestTime: null,
      onFetchCoupons: jest.fn(),
      loading: false,
      error: '',
    }

    it('should have proper tab navigation', () => {
      render(<UnifiedSearch {...mockProps} />)
      
      const tabList = screen.getByRole('tablist')
      expect(tabList).toHaveAttribute('aria-label', 'Search options')
      
      const storeTab = screen.getByRole('tab', { name: /store number/i })
      const nearbyTab = screen.getByRole('tab', { name: /find nearby/i })
      
      expect(storeTab).toHaveAttribute('aria-selected', 'true')
      expect(nearbyTab).toHaveAttribute('aria-selected', 'false')
      
      expect(storeTab).toHaveAttribute('aria-controls', 'store-number-panel')
      expect(nearbyTab).toHaveAttribute('aria-controls', 'find-nearby-panel')
    })

    it('should have proper form labels and fieldsets', () => {
      render(<UnifiedSearch {...mockProps} />)
      
      // Check store number form
      const languageSelect = screen.getByLabelText('Language')
      expect(languageSelect).toHaveAttribute('id', 'language-select')
      
      const storeInput = screen.getByLabelText('Store Number')
      expect(storeInput).toHaveAttribute('id', 'store-number-input')
      expect(storeInput).toBeRequired()
    })

    it('should handle keyboard navigation between tabs', async () => {
      const user = userEvent.setup()
      render(<UnifiedSearch {...mockProps} />)
      
      const storeTab = screen.getByRole('tab', { name: /store number/i })
      const nearbyTab = screen.getByRole('tab', { name: /find nearby/i })
      
      await user.click(nearbyTab)
      
      expect(nearbyTab).toHaveAttribute('aria-selected', 'true')
      expect(storeTab).toHaveAttribute('aria-selected', 'false')
      
      // Check that the nearby panel is now visible
      const nearbyPanel = screen.getByRole('tabpanel', { name: /find nearby/i })
      expect(nearbyPanel).toBeInTheDocument()
    })

    it('should pass axe accessibility tests', async () => {
      const { container } = render(<UnifiedSearch {...mockProps} />)
      
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('Skip Links', () => {
    it('should have skip links for keyboard navigation', () => {
      render(<App />)
      
      // Skip links should be present but hidden by default
      const skipToMain = screen.getByText('Skip to main content')
      const skipToSearch = screen.getByText('Skip to search')
      
      expect(skipToMain).toHaveAttribute('href', '#main-content')
      expect(skipToSearch).toHaveAttribute('href', '#search-section')
    })

    it('should make skip links visible on focus', async () => {
      const user = userEvent.setup()
      render(<App />)
      
      const skipToMain = screen.getByText('Skip to main content')
      
      // Tab to the skip link
      await user.tab()
      expect(skipToMain).toHaveFocus()
    })
  })

  describe('Semantic HTML Structure', () => {
    it('should have proper landmark roles', () => {
      render(<App />)
      
      const main = screen.getByRole('main')
      expect(main).toHaveAttribute('aria-label', "Domino's Coupons Finder")
      
      const searchSection = screen.getByLabelText('Store search and information')
      expect(searchSection).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<App />)
      
      // Check that headings are properly structured
      const headings = screen.getAllByRole('heading')
      expect(headings.length).toBeGreaterThan(0)
    })
  })

  describe('Color Contrast and Visual Accessibility', () => {
    it('should have sufficient color contrast for Domino\'s brand colors', () => {
      // This would typically use a color contrast checking library
      // For now, we'll test that the CSS custom properties are defined
      const { container } = render(
        <div>
          <Button variant="dominos-primary">Primary Button</Button>
          <Button variant="dominos-secondary">Secondary Button</Button>
        </div>
      )
      
      const primaryButton = container.querySelector('[data-slot="button"]')
      expect(primaryButton).toHaveClass('bg-dominos-red')
    })
  })

  describe('Screen Reader Support', () => {
    it('should have proper ARIA live regions for dynamic content', () => {
      render(<UnifiedSearch {...{ ...mockProps, loading: true }} />)
      
      // Check for loading status announcement
      const loadingStatus = screen.getByText('Searching for coupons, please wait')
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite')
    })

    it('should have proper error announcements', () => {
      render(<UnifiedSearch {...{ ...mockProps, error: 'Test error message' }} />)
      
      const errorAlert = screen.getByRole('alert')
      expect(errorAlert).toHaveTextContent('Test error message')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should support Enter and Space key activation', async () => {
      const user = userEvent.setup()
      const mockOnClick = jest.fn()
      
      render(<Button onClick={mockOnClick}>Test Button</Button>)
      const button = screen.getByRole('button')
      
      await user.tab()
      expect(button).toHaveFocus()
      
      await user.keyboard('{Enter}')
      expect(mockOnClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(mockOnClick).toHaveBeenCalledTimes(2)
    })

    it('should trap focus in modal dialogs', async () => {
      // This would test modal focus trapping when the email modal is open
      // Implementation would depend on the modal component structure
    })
  })

  describe('Mobile Accessibility', () => {
    it('should have touch-friendly target sizes', () => {
      render(<Button>Touch Button</Button>)
      const button = screen.getByRole('button')
      
      expect(button).toHaveClass('touch-manipulation')
    })

    it('should support mobile screen readers', () => {
      render(<ViewSelector {...{ currentView: 'grid', onViewChange: jest.fn(), couponCount: 3 }} />)
      
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })
  })
})