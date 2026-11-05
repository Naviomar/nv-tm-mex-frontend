import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

class RebateModule extends FetchFactory<any> {
  private CONTAINERS = '/rebate/containers'
  private PAYMENTS = '/rebate/payments'

  async getFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.CONTAINERS}/filters`, fetchOptions)
  }

  // Balances of references older than the debt age limit (they no longer hold the rebate).
  async getOldDebts(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.CONTAINERS}/old-debts`, fetchOptions)
  }

  async downloadOldDebts(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.CONTAINERS}/old-debts`, { ...fetchOptions, query: { format: 'xlsx' }, responseType: 'blob' })
  }

  // What the customer of a container owes (the "Owes" reason).
  async getDebt(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.CONTAINERS}/${id}/debt`, fetchOptions)
  }

  async getContainers(query: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('GET', this.CONTAINERS, { ...fetchOptions, query })
  }

  // Same selection contract as requestPayment: only the chosen containers go in the Excel.
  async downloadContainers(query: Record<string, any>, body: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.CONTAINERS}/download`, { ...fetchOptions, query, body, responseType: 'blob' })
  }

  // Selection goes in the body: `ids` (the chosen containers) or `all` + `exclude_ids` (everything matching the filters in `query`).
  async requestPayment(query: Record<string, any>, body: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.CONTAINERS}/request-payment`, { ...fetchOptions, query, body, responseType: 'blob' })
  }

  async getPayments(fetchOptions?: FetchOptions) {
    return this.call('GET', this.PAYMENTS, fetchOptions)
  }

  async getPayment(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.PAYMENTS}/${id}`, fetchOptions)
  }

  async downloadPayment(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.PAYMENTS}/${id}/download`, { ...fetchOptions, responseType: 'blob' })
  }

  async paymentAction(id: number, action: 'paid' | 'cancel', body?: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.PAYMENTS}/${id}/${action}`, { ...fetchOptions, body })
  }
}

export default RebateModule
