import { useState, useEffect, useRef } from 'react'
import type { DependencyList } from 'react'

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
  delay: number,
  deps: DependencyList = []
): T {
  const callbackRef = useRef(callback)
  const delayRef = useRef(delay)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const debouncedRef = useRef<(T & { cancel: () => void }) | undefined>(
    undefined
  )

  if (!debouncedRef.current) {
    debouncedRef.current = ((...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(
        () => callbackRef.current(...args),
        delayRef.current
      )
    }) as T & { cancel: () => void }

    debouncedRef.current.cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
    }
  }

  useEffect(() => {
    callbackRef.current = callback
    delayRef.current = delay

    const debounced = (...args: Parameters<T>) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(
        () => callbackRef.current(...args),
        delayRef.current
      )
    }

    debounced.cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
    }

    debouncedRef.current = debounced as T & { cancel: () => void }

    return () => {
      debounced.cancel()
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [callback, delay, ...deps])

  return debouncedRef.current as T
}

export default useDebounce
