import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IAlert {
  id: number
  alert_user_id: number
  title: string
  message: string | null
  severity: 'info' | 'warning' | 'error' | 'critical'
  icon: string | null
  color: string | null
  category: string | null
  action_url: string | null
  data: Record<string, any> | null
  read_at: string | null
  created_at: string
}

export interface IAlertsResponse {
  data: IAlert[]
  unread_count: number
}

export interface IAlertCategory {
  id: number
  name: string
  code: string
  icon: string | null
  color: string | null
  description: string | null
  is_active: boolean
}

export interface IAlertType {
  id: number
  alert_category_id: number
  name: string
  code: string
  description: string | null
  severity: 'info' | 'warning' | 'error' | 'critical'
  trigger_type: 'automatic' | 'manual' | 'scheduled'
  icon: string | null
  color: string | null
  is_active: boolean
  send_email: boolean
  send_push: boolean
  category?: IAlertCategory
  roles?: any[]
  users?: any[]
}

class AlertsModule extends FetchFactory<IAlertsResponse> {
  private RESOURCE = '/alerts'
  private ADMIN_CATEGORIES = '/admin/alert-categories'
  private ADMIN_TYPES = '/admin/alert-types'

  // User alerts endpoints
  async getAlerts(limit: number = 50, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}?limit=${limit}`, fetchOptions)
  }

  async getUnreadCount(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/unread-count`, fetchOptions)
  }

  async markAsRead(alertUserId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${alertUserId}/mark-read`, fetchOptions)
  }

  async markAllAsRead(fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/mark-all-read`, fetchOptions)
  }

  async dismiss(alertUserId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${alertUserId}/dismiss`, fetchOptions)
  }

  async dismissAll(fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/dismiss-all`, fetchOptions)
  }

  // Admin alert categories endpoints
  async getCategories(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.ADMIN_CATEGORIES}${query}`, fetchOptions)
  }

  async getAllCategories(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.ADMIN_CATEGORIES}/all`, fetchOptions)
  }

  async getCategoryById(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.ADMIN_CATEGORIES}/${id}`, fetchOptions)
  }

  async createCategory(form: Partial<IAlertCategory>, fetchOptions?: FetchOptions) {
    return this.call('POST', this.ADMIN_CATEGORIES, {
      body: form,
      ...fetchOptions,
    })
  }

  async updateCategory(id: number, form: Partial<IAlertCategory>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.ADMIN_CATEGORIES}/${id}`, {
      body: form,
      ...fetchOptions,
    })
  }

  async deleteCategory(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.ADMIN_CATEGORIES}/${id}`, fetchOptions)
  }

  // Admin alert types endpoints
  async getTypes(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.ADMIN_TYPES}${query}`, fetchOptions)
  }

  async getAllTypes(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.ADMIN_TYPES}/all`, fetchOptions)
  }

  async getTypeById(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.ADMIN_TYPES}/${id}`, fetchOptions)
  }

  async createType(form: Partial<IAlertType>, fetchOptions?: FetchOptions) {
    return this.call('POST', this.ADMIN_TYPES, {
      body: form,
      ...fetchOptions,
    })
  }

  async updateType(id: number, form: Partial<IAlertType>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.ADMIN_TYPES}/${id}`, {
      body: form,
      ...fetchOptions,
    })
  }

  async deleteType(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.ADMIN_TYPES}/${id}`, fetchOptions)
  }

  async syncTypeRoles(id: number, roles: number[], fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.ADMIN_TYPES}/${id}/sync-roles`, {
      body: { roles },
      ...fetchOptions,
    })
  }

  async syncTypeUsers(id: number, users: number[], fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.ADMIN_TYPES}/${id}/sync-users`, {
      body: { users },
      ...fetchOptions,
    })
  }
}

export default AlertsModule
