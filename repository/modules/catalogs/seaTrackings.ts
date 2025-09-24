import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class SeaTrackingModule extends FetchFactory<any> {
  private RESOURCE = '/sea-tracking'
  private PUBLIC_RESOURCE = '/public/sea-tracking'

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-service`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/tracking-details`, fetchOptions)
  }

  async upsert(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/upsert-event`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-event`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-event`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async publicSearch(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.PUBLIC_RESOURCE}/search`, fetchOptions)
  }

}

export default SeaTrackingModule
