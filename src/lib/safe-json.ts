/**
 * Safely parse JSON with fallback values
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value || value === 'null' || value === 'undefined') {
    return fallback
  }
  
  try {
    return JSON.parse(value)
  } catch (error) {
    console.warn('Failed to parse JSON:', value, error)
    return fallback
  }
}

/**
 * Safely stringify JSON with null check
 */
export function safeJsonStringify(value: any): string {
  if (value === null || value === undefined) {
    return '{}'
  }
  
  try {
    return JSON.stringify(value)
  } catch (error) {
    console.warn('Failed to stringify JSON:', value, error)
    return '{}'
  }
}