/**
 * Custom Error Types for Domain-Specific Error Handling
 * Addresses TypeScript Assessment Report - Priority Item #2
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id '${id}' not found`
      : `${resource} not found`
    super(message)
    this.name = "NotFoundError"
  }
}

export class ConfigurationError extends Error {
  constructor(setting: string) {
    super(`Configuration error: ${setting} is not properly configured`)
    this.name = "ConfigurationError"
  }
}

/**
 * Result type for operations that can fail
 * Implements functional error handling pattern
 */
export type Result<T, E = Error> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: E
    }

/**
 * Type guard for checking if a value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error
}

/**
 * Type guard for checking if a value is a specific error type
 */
export function isAPIError(value: unknown): value is APIError {
  return value instanceof APIError
}

export function isValidationError(value: unknown): value is ValidationError {
  return value instanceof ValidationError
}

export function isAuthenticationError(
  value: unknown
): value is AuthenticationError {
  return value instanceof AuthenticationError
}

export function isNotFoundError(value: unknown): value is NotFoundError {
  return value instanceof NotFoundError
}
