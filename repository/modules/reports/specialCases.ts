import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

class SpecialCasesModule extends FetchFactory<any> {
  private RESOURCE = '/reports/special-cases'

  async getCases(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getCase(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getIva(query?: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/iva`, { ...fetchOptions, query })
  }

  async downloadIva(query?: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/iva/download`, { ...fetchOptions, query, responseType: 'blob' })
  }

  async getImpact(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/impact`, fetchOptions)
  }

  async getTemplates(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/templates`, fetchOptions)
  }

  async searchConsignees(q: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/consignees`, { ...fetchOptions, query: { q } })
  }

  async create(template: string, values: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('POST', this.RESOURCE, { ...fetchOptions, body: { template, values } })
  }

  async preview(id: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/preview`, fetchOptions)
  }

  async apply(id: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/apply`, fetchOptions)
  }

  async recover(id: number, body: { system: string; external_id: string; amount: number }, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/recover`, { ...fetchOptions, body })
  }

  async reverse(id: number, allocationId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/allocations/${allocationId}/reverse`, fetchOptions)
  }

  async setStatus(id: number, status: 'active' | 'paused', fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/status`, { ...fetchOptions, body: { status } })
  }
}

export default SpecialCasesModule
