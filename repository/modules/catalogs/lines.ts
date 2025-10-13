import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

type IPagination = {
  page: string
  limit: string
}
type ILinePagination = {
  data: ILine[]
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
type ILine = {
  id: number
  code: string
  name: string
  country_id: number
  line_executives: any[]
}

class LinesModule extends FetchFactory<any> {
  private RESOURCE = '/admin/lines'
  private RESOURCE2 = '/lines'

  /**
   * Return the lines as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getLines(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchLines(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }

  /**
   * Return a port
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async saveInternalTransitFile(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/internal-transit/add-file`, fetchOptions)
  }

  async getCreditNotesPaged(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', `${this.RESOURCE2}/credit-notes`, fetchOptions)
  }

  async getCreditNoteCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/credit-notes/catalogs`, fetchOptions)
  }

  async searchInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/credit-notes/search-invoice`, fetchOptions)
  }

  async createNote(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/credit-notes/create-note`, fetchOptions)
  }

  async getCreditNoteById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/credit-notes/${id}/details`, fetchOptions)
  }

  async creditNotePayInvoices(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/credit-notes/${id}/pay-invoices`, fetchOptions)
  }

  async creditNoteSearchPayableInvoices(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/credit-notes/${id}/search-payable-invoices`, fetchOptions)
  }

  async saveAutomaticCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/save-automatic-charge`, fetchOptions)
  }

  async deleteAutomaticCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/delete-automatic-charge`, fetchOptions)
  }

  async getAddresses(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/addresses/all`, fetchOptions)
  }

  async updateAddress(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/address`, fetchOptions)
  }

  async deleteAddress(id: string, idAddress: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}/address/${idAddress}`, fetchOptions)
  }

  async getLineBanks(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/banks`, fetchOptions)
  }

  async formBankCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-bank-catalogs`, fetchOptions)
  }

  async upsertBank(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/upsert-bank`, fetchOptions)
  }

  async deleteBank(lineId: string, id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${lineId}/banks/${id}/delete`, fetchOptions)
  }

  async addEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-email`, fetchOptions)
  }

  async deleteEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-email`, fetchOptions)
  }

  async getLineNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/notes`, fetchOptions)
  }

  async addLineNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-note`, fetchOptions)
  }

  async getAgentsAll(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/agents/all`, fetchOptions)
  }

  async linkAgent(lineId: number, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${lineId}/link-agent`, fetchOptions)
  }

  async getLinkedAgents(lineId: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${lineId}/linked-agents`, fetchOptions)
  }

  async deleteLinkedAgent(lineId: string, agentId: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${lineId}/linked-agents/${agentId}`, fetchOptions)
  }
}

export default LinesModule
