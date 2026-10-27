import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export type SecurityScope = 'all' | 'departments' | 'roles' | 'users'

export interface SecurityTarget {
  scope: SecurityScope
  department_ids?: number[]
  role_ids?: number[]
  user_ids?: number[]
  include_inactive?: boolean
}

const json = (body: any, fetchOptions?: FetchOptions) => ({ body: JSON.stringify(body), ...fetchOptions })

/**
 * Seguridad de acceso: autoservicio (estado, cambio de contraseña, doble factor de Fortify),
 * administración (cambio obligatorio, 2FA exigido, bitácora), baja de notificaciones y clonado.
 */
export default class AccountSecurityModule extends FetchFactory<any> {
  // --- Autoservicio ---
  async status(fetchOptions?: FetchOptions) {
    return this.call('GET', '/account-security/status', fetchOptions)
  }

  async changePassword(data: { current_password: string; password: string; password_confirmation: string }, fetchOptions?: FetchOptions) {
    return this.call('POST', '/account-security/password', json(data, fetchOptions))
  }

  async myLoginEvents(page = 1, fetchOptions?: FetchOptions) {
    return this.call('GET', '/account-security/login-events', { query: { page }, ...fetchOptions })
  }

  // --- Doble factor (rutas de Fortify) ---
  async confirmPassword(password: string, fetchOptions?: FetchOptions) {
    return this.call('POST', '/user/confirm-password', json({ password }, fetchOptions))
  }

  async enableTwoFactor(fetchOptions?: FetchOptions) {
    return this.call('POST', '/user/two-factor-authentication', fetchOptions)
  }

  async disableTwoFactor(fetchOptions?: FetchOptions) {
    return this.call('DELETE', '/user/two-factor-authentication', fetchOptions)
  }

  async twoFactorQrCode(fetchOptions?: FetchOptions) {
    return this.call('GET', '/user/two-factor-qr-code', fetchOptions)
  }

  async twoFactorSecretKey(fetchOptions?: FetchOptions) {
    return this.call('GET', '/user/two-factor-secret-key', fetchOptions)
  }

  async confirmTwoFactor(code: string, fetchOptions?: FetchOptions) {
    return this.call('POST', '/user/confirmed-two-factor-authentication', json({ code }, fetchOptions))
  }

  async recoveryCodes(fetchOptions?: FetchOptions) {
    return this.call('GET', '/user/two-factor-recovery-codes', fetchOptions)
  }

  async regenerateRecoveryCodes(fetchOptions?: FetchOptions) {
    return this.call('POST', '/user/two-factor-recovery-codes', fetchOptions)
  }

  async twoFactorChallenge(data: { code?: string; recovery_code?: string }, fetchOptions?: FetchOptions) {
    return this.call('POST', '/two-factor-challenge', json(data, fetchOptions))
  }

  // --- Administración ---
  async catalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', '/admin/account-security/catalogs', fetchOptions)
  }

  async overview(fetchOptions?: FetchOptions) {
    return this.call('GET', '/admin/account-security/overview', fetchOptions)
  }

  async preview(target: SecurityTarget, fetchOptions?: FetchOptions) {
    return this.call('POST', '/admin/account-security/preview', json(target, fetchOptions))
  }

  async forcePasswordChange(target: SecurityTarget & { active?: boolean; reason?: string | null }, fetchOptions?: FetchOptions) {
    return this.call('POST', '/admin/account-security/force-password-change', json(target, fetchOptions))
  }

  async requireTwoFactor(target: SecurityTarget & { required: boolean; reason?: string | null }, fetchOptions?: FetchOptions) {
    return this.call('POST', '/admin/account-security/require-two-factor', json(target, fetchOptions))
  }

  async loginEvents(query: Record<string, any> = {}, fetchOptions?: FetchOptions) {
    return this.call('GET', '/admin/account-security/login-events', { query, ...fetchOptions })
  }

  async actions(query: Record<string, any> = {}, fetchOptions?: FetchOptions) {
    return this.call('GET', '/admin/account-security/actions', { query, ...fetchOptions })
  }

  async userStatus(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `/admin/users/${userId}/account-security`, fetchOptions)
  }

  async userLoginEvents(userId: number | string, page = 1, fetchOptions?: FetchOptions) {
    return this.call('GET', `/admin/users/${userId}/account-security/login-events`, { query: { page }, ...fetchOptions })
  }

  async resetTwoFactor(userId: number | string, reason?: string | null, fetchOptions?: FetchOptions) {
    return this.call('POST', `/admin/users/${userId}/account-security/reset-two-factor`, json({ reason }, fetchOptions))
  }

  async unlock(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('POST', `/admin/users/${userId}/account-security/unlock`, fetchOptions)
  }

  // --- Notificaciones y clonado ---
  async notificationFootprint(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `/admin/users/${userId}/notification-footprint`, fetchOptions)
  }

  async removeNotifications(userId: number | string, selection: Record<string, number[]>, reason?: string | null, fetchOptions?: FetchOptions) {
    return this.call('POST', `/admin/users/${userId}/notification-footprint/remove`, json({ selection, reason }, fetchOptions))
  }

  async undoAction(actionId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `/admin/account-security/actions/${actionId}/undo`, fetchOptions)
  }

  async clonePreview(targetUserId: number | string, sourceUserId: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `/admin/users/${targetUserId}/clone-preview`, { query: { source_user_id: sourceUserId }, ...fetchOptions })
  }

  async cloneFrom(targetUserId: number | string, data: { source_user_id: number; blocks: string[]; reason?: string | null }, fetchOptions?: FetchOptions) {
    return this.call('POST', `/admin/users/${targetUserId}/clone-from`, json(data, fetchOptions))
  }
}
