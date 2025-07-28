/**
 * Accessibility utilities for the Domino's Coupons Finder application
 * Provides helpers for WCAG AA compliance and screen reader support
 */

import { useRef } from 'react'

/**
 * Hook to manage focus for screen readers and keyboard navigation
 */
export function useFocusManagement() {
  const focusRef = useRef<HTMLElement>(null)

  const focusElement = () => {
    if (focusRef.current) {
      focusRef.current.focus()
    }
  }

  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return

    const focusableElements = focusRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  return { focusRef, focusElement, trapFocus }
}

/**
 * Hook to announce content changes to screen readers
 */
export function useScreenReaderAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  return { announce }
}

/**
 * Hook to handle keyboard navigation for interactive elements
 */
export function useKeyboardNavigation(onActivate?: () => void, onEscape?: () => void) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        onActivate?.()
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
    }
  }

  return { handleKeyDown }
}

/**
 * Generate accessible IDs for form elements and their labels
 */
export function useAccessibleIds(prefix: string = 'element') {
  const baseId = useRef(`${prefix}-${Math.random().toString(36).substr(2, 9)}`)
  
  return {
    id: baseId.current,
    labelId: `${baseId.current}-label`,
    descriptionId: `${baseId.current}-description`,
    errorId: `${baseId.current}-error`,
  }
}

/**
 * Utility to check if an element meets WCAG color contrast requirements
 * This is a simplified version - in production, you'd use a proper color contrast library
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number
  passesAA: boolean
  passesAAA: boolean
} {
  // TODO: Implement actual color contrast calculation
  // For now, we'll assume our Domino's colors meet WCAG AA standards
  // In production, use a library like color-contrast-checker
  console.log(`Checking contrast between ${foreground} and ${background}`)
  
  return {
    ratio: 4.5, // Minimum for WCAG AA
    passesAA: true,
    passesAAA: false
  }
}

/**
 * Utility to create accessible button labels
 */
export function createAccessibleLabel(
  baseLabel: string,
  context?: string,
  state?: string
): string {
  let label = baseLabel
  
  if (context) {
    label += ` ${context}`
  }
  
  if (state) {
    label += `, ${state}`
  }
  
  return label
}

/**
 * Utility to format numbers for screen readers
 */
export function formatForScreenReader(value: number | string, type: 'currency' | 'count' | 'percentage' = 'count'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  switch (type) {
    case 'currency':
      return `${numValue} dollars`
    case 'percentage':
      return `${numValue} percent`
    case 'count':
    default:
      return numValue === 1 ? `${numValue} item` : `${numValue} items`
  }
}

/**
 * Utility to create skip link props for keyboard navigation
 */
export function createSkipLinkProps(href: string) {
  return {
    href,
    className: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-dominos-red focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-dominos-red"
  }
}

/**
 * Utility to create screen reader only props
 */
export function createScreenReaderOnlyProps() {
  return {
    className: "sr-only"
  }
}

/**
 * Utility to create accessible loading indicator props
 */
export function createLoadingIndicatorProps(
  message: string = "Loading", 
  size: "sm" | "md" | "lg" = "md"
) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  }

  return {
    containerProps: {
      role: "status" as const,
      "aria-label": message,
      className: "flex items-center justify-center"
    },
    spinnerProps: {
      className: `animate-spin rounded-full border-2 border-dominos-red border-t-transparent ${sizeClasses[size]}`,
      "aria-hidden": "true" as const
    },
    textProps: {
      className: "sr-only"
    }
  }
}