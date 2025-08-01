import { useState, useEffect, useRef, useMemo } from 'react'

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
 * @returns Debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback)

  // Always keep latest callback in ref so debounced function
  // uses fresh values without needing to recreate on every render
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedCallback = useMemo(() => {
    let timeoutId: NodeJS.Timeout

    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => callbackRef.current(...args), delay)
    }

    ;(debounced as T & { cancel: () => void }).cancel = () => clearTimeout(timeoutId)

    return debounced as T
    }, [delay])

  useEffect(() => {
    return () => {
      ;(debouncedCallback as T & { cancel?: () => void }).cancel?.()
    }
  }, [debouncedCallback])

  return debouncedCallback
}

export default useDebounce
