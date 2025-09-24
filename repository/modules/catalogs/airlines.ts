import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

class AirlineModule extends FetchFactory<any> {
  private RESOURCE = '/admin/airlines'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getAirlines(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchAirlines(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default AirlineModule
