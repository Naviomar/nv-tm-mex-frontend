import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IFreightForwarderPagination = {
  data: IFreightForwarder[]
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
type IFreightForwarder = {
  id: number
  name: string
  freight_banks: []
  emails: []
}

class FreightForwardersModule extends FetchFactory<any> {
  private RESOURCE = '/admin/freight-forwarders'
  private RESOURCE2 = '/freight-forwarders'

  async getFreightForwarders(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAllFreightForwarders(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async searchFfs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/search`, fetchOptions)
  }

  async searchFfGroups(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/search-groups`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getFfEmails(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/${id}/get-emails`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }


  /**
   * Return a freight
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
  async deleteFreightBank(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/freight-bank-account/${id}`, fetchOptions)
  }

  async addEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/add-email`, fetchOptions)
  }

  async deleteEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/delete-email`, fetchOptions)
  }

  async getNotesSOA(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/soa-notes`, fetchOptions)
  }

  async getNotesPayments(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/payments-notes`, fetchOptions)
  }

  async getFfNotes(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/ff-notes`, fetchOptions)
  }

  async getFfNoteById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/ff-notes/${id}/details`, fetchOptions)
  }

  async getNotesFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/ff-notes-filters`, fetchOptions)
  }

  async createFfNote(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/ff-notes`, fetchOptions)
  }

  async searchSeaReferenceByMasterBl(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/search-referencia`, fetchOptions)
  }

  async searchServiceReferenceByMasterBl(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/search-service-referencia`, fetchOptions)
  }
}

export default FreightForwardersModule
