import { useState, useEffect } from 'react'

/**
 * Custom hook for debouncing values
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Custom hook for debounced callbacks
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @param deps - Dependencies array
 * @returns Debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const [debouncedCallback] = useState(() => {
    let timeoutId: NodeJS.Timeout

    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callback(...args), delay)
    }

    // Add cleanup method
    ;(debounced as T & { cancel: () => void }).cancel = () => clearTimeout(timeoutId)

    return debounced as T
  })

  useEffect(() => {
    return () => {
      ;(debouncedCallback as T & { cancel?: () => void }).cancel?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCallback, ...deps])

  return debouncedCallback
}

export default useDebounce