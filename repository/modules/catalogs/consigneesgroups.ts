import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IConsigneeGroupPagination = {
  data: IConsigneerGroup[]
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
type IConsigneerGroup = {
  id: number
  name: string
  code: string
}

class ConsigneesGroupsModule extends FetchFactory<IConsigneeGroupPagination> {
  private RESOURCE = '/admin/consignee/groups'

  async getConsigneesGroups(fetchOptions?: FetchOptions) {
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

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getConsigneesInAGroup(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/consignees/${id}`, fetchOptions)
  }

  async linkCustomerToGroup(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/link-customer`, fetchOptions)
  }

  async removeCustomerFromGroup(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/remove-customer`, fetchOptions)
  }

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
}

export default ConsigneesGroupsModule
