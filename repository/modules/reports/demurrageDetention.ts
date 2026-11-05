import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

class DemurrageDetentionModule extends FetchFactory<any> {
  private RESOURCE = '/reports/demurrage-detention'

  async getOptions(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/options`, fetchOptions)
  }

  async searchCustomers(q: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/customers`, { ...fetchOptions, query: { q } })
  }

  async getReport(query: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, { ...fetchOptions, query })
  }

  async download(query: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/download`, { ...fetchOptions, query, responseType: 'blob' })
  }
}

export default DemurrageDetentionModule
