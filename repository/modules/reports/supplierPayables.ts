import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

class SupplierPayablesModule extends FetchFactory<any> {
  private RESOURCE = '/reports/supplier-payables'

  async getOptions(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/options`, fetchOptions)
  }

  async getReport(query: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, { ...fetchOptions, query })
  }

  async download(query: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/download`, { ...fetchOptions, query, responseType: 'blob' })
  }
}

export default SupplierPayablesModule
