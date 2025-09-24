import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'


class AirportModule extends FetchFactory<any> {
  private RESOURCE = '/admin/airports'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getAirports(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  /**
   * Return a sea traffic
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

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
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

export default AirportModule
