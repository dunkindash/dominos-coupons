/**
 * src/lib/logger.ts
 * 
 * Production-ready logging system for Domino's Coupons application
 * Requirements: Node.js 18+, TypeScript 5.0+
 * Dependencies: None (uses native console with structured formatting)
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
    name: string
  }
}

class Logger {
  private level: LogLevel
  private isDevelopment: boolean

  constructor() {
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development'
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      ...(context && { context }),
      ...(error && { error: { message: error.message, stack: error.stack, name: error.name } })
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level
  }

  private output(logEntry: LogEntry, consoleMethod: 'error' | 'warn' | 'info' | 'log'): void {
    if (this.isDevelopment) {
      // Development: Pretty formatted output
      const prefix = `[${logEntry.timestamp}] ${logEntry.level}:`
      if (logEntry.context || logEntry.error) {
        console[consoleMethod](prefix, logEntry.message, {
          ...(logEntry.context && { context: logEntry.context }),
          ...(logEntry.error && { error: logEntry.error })
        })
      } else {
        console[consoleMethod](prefix, logEntry.message)
      }
    } else {
      // Production: Structured JSON output for log aggregation
      console[consoleMethod](JSON.stringify(logEntry))
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    const logEntry = this.formatMessage(LogLevel.ERROR, message, context, error)
    this.output(logEntry, 'error')
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    const logEntry = this.formatMessage(LogLevel.WARN, message, context)
    this.output(logEntry, 'warn')
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    const logEntry = this.formatMessage(LogLevel.INFO, message, context)
    this.output(logEntry, 'info')
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    const logEntry = this.formatMessage(LogLevel.DEBUG, message, context)
    this.output(logEntry, 'log')
  }

  // Convenience methods for common use cases
  apiRequest(method: string, endpoint: string, context?: Record<string, unknown>): void {
    this.info(`API Request: ${method} ${endpoint}`, context)
  }

  apiResponse(method: string, endpoint: string, status: number, context?: Record<string, unknown>): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    const message = `API Response: ${method} ${endpoint} - ${status}`
    
    if (level === LogLevel.ERROR) {
      this.error(message, context)
    } else {
      this.info(message, context)
    }
  }

  validation(field: string, error: string, value?: unknown): void {
    this.warn(`Validation failed for ${field}: ${error}`, { field, value })
  }

  security(event: string, context?: Record<string, unknown>): void {
    this.warn(`Security event: ${event}`, context)
  }

  performance(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, context)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export for testing
export { Logger }
