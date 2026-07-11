const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function parseEmailList(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
}

export function useEmailListValidation() {
  function hasAtLeastOneValidEmail(raw: string | null | undefined): boolean {
    return parseEmailList(raw).some((e) => EMAIL_REGEX.test(e))
  }

  function emailListRule(raw: string | null | undefined): true | string {
    return hasAtLeastOneValidEmail(raw) || 'Ingresa al menos un correo válido, separado por comas'
  }

  return { hasAtLeastOneValidEmail, emailListRule, parseEmailList }
}
