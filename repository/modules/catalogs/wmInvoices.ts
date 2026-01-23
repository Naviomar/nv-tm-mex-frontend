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

class WmInvoicesModule extends FetchFactory<IPortPagination> {
  private RESOURCE = '/wm-invoices'

  /**
   * Return the ports as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/service-sea`, fetchOptions)
  }

async getUnifiedPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/unified`, fetchOptions)
  }

  async getAirPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/service-air`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/by-service`, fetchOptions)
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

  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async updateProforma(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-service-proforma`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

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

  async getInvoiceToCancel(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/invoice-to-cancel`, fetchOptions)
  }

  async exportInvoicesToExcel(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/export-invoices-to-excel`, fetchOptions)
  }
}

export default WmInvoicesModule
