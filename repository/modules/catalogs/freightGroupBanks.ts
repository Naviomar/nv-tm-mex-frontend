import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class FreightGroupBanksModule extends FetchFactory<any> {
  private RESOURCE = '/freight-group-banks'

  async getFreightGroupBanks(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/group/${id}/all`, fetchOptions)
  }

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAll(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async formCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async upsert(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/upsert`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }
}

export default FreightGroupBanksModule
