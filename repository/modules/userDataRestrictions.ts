import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IUserDataRestriction {
  id: number
  user_id: number
  restriction_type: 'executive' | 'customer'
  executive_id: number | null
  consignee_id: number | null
  is_active: boolean
  executive?: { id: number; name: string }
  consignee?: { id: number; name: string }
  created_at: string
  updated_at: string
}

export interface IRestrictionSummary {
  is_restricted: boolean
  executives: { id: number; name: string }[]
  direct_customers: { id: number; name: string }[]
  total_visible_customers: number | null
}

export default class UserDataRestrictionsModule extends FetchFactory<any> {
  private RESOURCE = '/admin/users'

  async list(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${userId}/data-restrictions`, fetchOptions)
  }

  async create(userId: number | string, data: Partial<IUserDataRestriction>, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${userId}/data-restrictions`, {
      body: JSON.stringify(data),
      ...fetchOptions,
    })
  }

  async update(userId: number | string, id: number, data: Partial<IUserDataRestriction>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/${userId}/data-restrictions/${id}`, {
      body: JSON.stringify(data),
      ...fetchOptions,
    })
  }

  async delete(userId: number | string, id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${userId}/data-restrictions/${id}`, fetchOptions)
  }

  async getSummary(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${userId}/data-restrictions/summary`, fetchOptions)
  }

  async bulkSync(userId: number | string, restrictions: Partial<IUserDataRestriction>[], fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${userId}/data-restrictions/bulk`, {
      body: JSON.stringify({ restrictions }),
      ...fetchOptions,
    })
  }
}
