import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class SupplierTypesModule extends FetchFactory<any> {
  private RESOURCE = '/supplier-types'

  /**
 * Return the shippers as array
 * @param fetchOptions options for `useFetch`
 * @returns
 */
  async getPaged(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAll(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  /**
   * Return a shipper
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
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }

}

export default SupplierTypesModule
