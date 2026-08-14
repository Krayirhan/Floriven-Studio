export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; issues: string[] }

export type JsonObject = Record<string, unknown>

export function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function nonEmptyString(value: unknown, path: string, issues: string[], maxLength = 240): value is string {
  if (typeof value !== 'string' || !value.trim()) {
    issues.push(`${path}: non-empty string required`)
    return false
  }
  if (value.length > maxLength) issues.push(`${path}: exceeds ${maxLength} characters`)
  return true
}

export function stringList(value: unknown, path: string, issues: string[], options: { min?: number; max?: number } = {}): value is string[] {
  if (!Array.isArray(value)) {
    issues.push(`${path}: string array required`)
    return false
  }
  const min = options.min ?? 0
  const max = options.max ?? 30
  if (value.length < min) issues.push(`${path}: at least ${min} items required`)
  if (value.length > max) issues.push(`${path}: at most ${max} items allowed`)
  value.forEach((item, index) => nonEmptyString(item, `${path}[${index}]`, issues, 160))
  if (new Set(value.map((item) => typeof item === 'string' ? canonical(item) : String(item))).size !== value.length) {
    issues.push(`${path}: duplicate values are not allowed`)
  }
  return value.every((item) => typeof item === 'string' && !!item.trim())
}

export function exactKeys(value: JsonObject, allowed: readonly string[], path: string, issues: string[]): void {
  const allowedSet = new Set(allowed)
  for (const key of Object.keys(value)) if (!allowedSet.has(key)) issues.push(`${path}.${key}: unknown field`)
}

export function canonical(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ')
}

export function uniqueIds(items: Array<{ id: string }>, path: string, issues: string[]): void {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) issues.push(`${path}: duplicate id ${item.id}`)
    seen.add(item.id)
  }
}

export function parseStrictJsonObject(text: string): ValidationResult<JsonObject> {
  try {
    const value: unknown = JSON.parse(text)
    return isObject(value) ? { ok: true, value } : { ok: false, issues: ['response: JSON object required'] }
  } catch {
    return { ok: false, issues: ['response: strict JSON parsing failed'] }
  }
}
