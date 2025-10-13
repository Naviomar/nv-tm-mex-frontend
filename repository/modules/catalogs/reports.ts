import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class ReportsModule extends FetchFactory<any> {
  private RESOURCE = '/reports'

  async getCobranza(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/cobranza`, fetchOptions)
  }

  async getCustomerInvoices(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/customer-invoices`, fetchOptions)
  }

  async getMovementPayments(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/movements-payments`, fetchOptions)
  }

  async getPaymentsHistory(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/payments-history`, fetchOptions)
  }

  async getChargesPendingInvoice(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/charges-pending-invoice`, fetchOptions)
  }


}

export default ReportsModule
