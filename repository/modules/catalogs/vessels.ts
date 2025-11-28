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
type IVessel = {
  id: number
  name: string
  code: string
}

class VesselsModule extends FetchFactory<IShipperPagination> {
  private RESOURCE = '/admin/vessels'
  private RESOURCE2 = '/admin/vessel-names'

  async getVessels(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }
  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getVesselDetails(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

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
    return this.call('POST', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getVesselNames(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}`, fetchOptions)
  }

  async deleteVesselName(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/delete`, fetchOptions)
  }

  async newVesselName(name: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify({ name }),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}`, fetchOptions)
  }
}

export default VesselsModule
