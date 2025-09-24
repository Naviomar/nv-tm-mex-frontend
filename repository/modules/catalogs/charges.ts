import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IChargePagination = {
  data: ICharge[]
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
type ICharge = {
  id: number
  name: string
  code: string
  is_local: string
  default_amount: number
}

class ChargesModule extends FetchFactory<IChargePagination> {
  private RESOURCE = '/admin/charges'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getCharges(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAll(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getAllChargesInfo(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all-info`, fetchOptions)
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

  async addCfdiName(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-cfdi-name`, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }

  async deleteCfdiName(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-cfdi-name`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getAllCfdiNames(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdi-names/all`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async seedCharges(fetchOptions?: FetchOptions) {
    return this.call('GET', `/tests/seeds/charges`, fetchOptions)
  }
}

export default ChargesModule
