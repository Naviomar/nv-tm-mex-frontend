import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

class StatisticsModule extends FetchFactory<any> {
  private RESOURCE = '/statistics'

  async usageStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage${query}`, fetchOptions)
  }

  async referencesStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/references${query}`, fetchOptions)
  }

  async chargesStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/charges${query}`, fetchOptions)
  }

  async invoicesStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/invoices${query}`, fetchOptions)
  }

  async demurragesStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/demurrages${query}`, fetchOptions)
  }

  async paymentsStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/payments${query}`, fetchOptions)
  }

  async supplierPaymentsStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/supplier-payments${query}`, fetchOptions)
  }

  async ffPaymentsStats(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/usage/ff-payments${query}`, fetchOptions)
  }
}

export default StatisticsModule
