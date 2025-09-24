import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IPortPagination = {
  data: IPort[]
  total: number
  last_page: number
  per_page: number
  current_page: number
  page: number
  total_pages: number
  links: {
    previous: string
    next: string
  }
}
type IPort = {
  id: number
  code: string
  name: string
}

class WmAirInvoicesModule extends FetchFactory<IPortPagination> {
  private RESOURCE = '/wm-air-invoices'

  /**
   * Return the ports as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/service-sea`, fetchOptions)
  }

  async getAirPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/service-air`, fetchOptions)
  }


  async getCommissionsPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/commissions`, fetchOptions)
  }

  async applyBankCommission(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/apply-commission`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/proforma-catalogs`, fetchOptions)
  }

  async getFilterCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/filter-catalogs`, fetchOptions)
  }

  async showPdfInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/preview-by-service-pdf`, fetchOptions)
  }


  async updateProforma(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-proforma`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getInvoiceToCancel(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/invoice-to-cancel`, fetchOptions)
  }

  // async cancelInvoice(body: any, fetchOptions?: FetchOptions) {
  //   fetchOptions = {
  //     method: 'POST',
  //     body: JSON.stringify(body),
  //     ...fetchOptions,
  //   }
  //   return this.call('POST', `${this.RESOURCE}/${id}/cancel-invoice`, fetchOptions)
  // }

  async findDeletedInvoicesToLink(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/find-deleted-invoices-to-link`, fetchOptions)
  }

  async cancel(id: string, body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/cancel`, fetchOptions)
  }

  async exportInvoicesToExcel(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/export-invoices-to-excel`, fetchOptions)
  }
}

export default WmAirInvoicesModule
