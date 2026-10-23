export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function isValidProjectName(value: string): boolean {
  return isNonEmptyString(value) && value.trim().length >= 2 && value.trim().length <= 80
}

export function isSafeIdentifier(value: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(value)
}
