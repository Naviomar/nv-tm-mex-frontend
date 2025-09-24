import { type FetchOptions, type $Fetch } from 'ofetch'

import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
class AirServiceModule extends FetchFactory<any> {
  private RESOURCE = '/air-services'

  async getSupplierInvoices(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/supplier-invoices`, fetchOptions)
  }

  async getRefunds(id: any, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/refunds`, fetchOptions)
  }
}

export default AirServiceModule
