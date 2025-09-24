import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IServicesContractsPagination = {
  data: IServiceContact[]
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
type IServiceContact = {
  id: number
  name: string
  country_id: number
}

class ServicesContractModule extends FetchFactory<IServicesContractsPagination> {
  private RESOURCE = '/admin/destinations'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getDestinations(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchDestinations(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

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
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  /**
   * Delete a user by id
   * @param user
   * @returns
   */
  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default ServicesContractModule
