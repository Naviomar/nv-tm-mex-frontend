import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IShipperPagination = {
  data: IShipper[]
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
type IShipper = {
  id: number
  name: string
}

class ShippersModule extends FetchFactory<IShipperPagination> {
  private RESOURCE = '/admin/shippers'

  /**
   * Return the shippers as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getShippers(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }

  async searchShippers(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async getById(id: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
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

  async update(id: any, form: any, fetchOptions?: FetchOptions) {
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
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default ShippersModule
