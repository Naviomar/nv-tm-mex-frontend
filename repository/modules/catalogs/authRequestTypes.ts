import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface IAuthRequestType {
  id: number
  kind: 'authorization' | 'process'
  code: string
  description: string
  redirect: string | null
  key_label: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

class AuthRequestTypesModule extends FetchFactory<IAuthRequestType[]> {
  private RESOURCE = '/auth-request-types'

  async getTypes(params?: { kind?: string; active?: boolean }, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params as any).toString() : ''
    return this.call('GET', `${this.RESOURCE}${query}`, fetchOptions)
  }

  async getTypeById(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async createType(form: Partial<IAuthRequestType>, fetchOptions?: FetchOptions) {
    return this.call('POST', this.RESOURCE, {
      body: form,
      ...fetchOptions,
    })
  }

  async updateType(id: number, form: Partial<IAuthRequestType>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/${id}`, {
      body: form,
      ...fetchOptions,
    })
  }

  async deleteType(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default AuthRequestTypesModule
