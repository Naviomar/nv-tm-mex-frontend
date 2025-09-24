import { type FetchOptions, type $Fetch } from 'ofetch'

import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'


class LineCreditNotesModule extends FetchFactory<any> {
  private RESOURCE = '/line-credit-notes'


  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async updateFolio(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-folio`, fetchOptions)
  }

  async searchLineInvoicesToPay(id: string, body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/search-line-invoices-to-pay`, fetchOptions)
  }

  async payLineInvoices(id: string, body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/pay-line-invoices`, fetchOptions)
  }

}

export default LineCreditNotesModule
