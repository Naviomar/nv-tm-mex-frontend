// Etiquetas y colores de la bitácora de accesos (user_login_events) y de las acciones de seguridad.
export const loginEventMeta: Record<string, { label: string; color: string; icon: string }> = {
  login: { label: 'Signed in', color: 'success', icon: 'mdi-login' },
  login_failed: { label: 'Failed sign-in', color: 'error', icon: 'mdi-alert-circle-outline' },
  logout: { label: 'Signed out', color: 'grey', icon: 'mdi-logout' },
  locked: { label: 'Account locked', color: 'error', icon: 'mdi-lock-alert-outline' },
  blocked_inactive: { label: 'Inactive account', color: 'warning', icon: 'mdi-account-cancel-outline' },
  two_factor_challenged: { label: '2FA code requested', color: 'info', icon: 'mdi-cellphone-key' },
  two_factor_failed: { label: 'Wrong 2FA code', color: 'error', icon: 'mdi-cellphone-remove' },
  two_factor_enabled: { label: '2FA enabled', color: 'success', icon: 'mdi-shield-check-outline' },
  two_factor_disabled: { label: '2FA disabled', color: 'warning', icon: 'mdi-shield-off-outline' },
  two_factor_reset: { label: '2FA reset by admin', color: 'warning', icon: 'mdi-shield-refresh-outline' },
  recovery_code_used: { label: 'Recovery code used', color: 'warning', icon: 'mdi-key-alert-outline' },
  password_changed: { label: 'Password changed', color: 'success', icon: 'mdi-form-textbox-password' },
  password_reset: { label: 'Password reset by email', color: 'success', icon: 'mdi-email-lock-outline' },
  password_change_required: { label: 'Password change required', color: 'warning', icon: 'mdi-lock-reset' },
}

export const securityActionMeta: Record<string, { label: string; color: string; icon: string }> = {
  force_password_change: { label: 'Forced password change', color: 'warning', icon: 'mdi-lock-reset' },
  cancel_password_change: { label: 'Cancelled password change', color: 'grey', icon: 'mdi-lock-open-variant-outline' },
  require_two_factor: { label: 'Required 2FA', color: 'primary', icon: 'mdi-shield-key-outline' },
  release_two_factor: { label: 'Released 2FA requirement', color: 'grey', icon: 'mdi-shield-off-outline' },
  reset_two_factor: { label: 'Reset 2FA', color: 'warning', icon: 'mdi-shield-refresh-outline' },
  unlock: { label: 'Unlocked account', color: 'success', icon: 'mdi-lock-open-outline' },
  remove_notifications: { label: 'Removed from notifications', color: 'error', icon: 'mdi-bell-remove-outline' },
  clone_user: { label: 'Cloned user', color: 'info', icon: 'mdi-account-multiple-plus-outline' },
}

export function describeUserAgent(ua?: string | null): string {
  if (!ua) return ''
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Other'
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : ''
  return [browser, os].filter(Boolean).join(' · ')
}

// Códigos que manda el backend cuando la sesión tiene pendiente un requisito de seguridad.
export const SECURITY_REQUIRED_CODES = ['password_change_required', 'two_factor_setup_required']
export const SECURITY_REQUIRED_ROUTE = '/system/auth/security-required'

export function pendingSecurityRequirement(user: any): 'password' | 'two_factor' | null {
  if (!user) return null
  if (user.must_change_password) return 'password'
  if (user.two_factor_required && !user.two_factor_confirmed_at) return 'two_factor'
  return null
}
