import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

class QuoteRoutesModule extends FetchFactory<any> {
  private RESOURCE = '/quote-routes'

  async getRoutes(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async searchRoutes(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async getRouteById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async createRoute(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async updateRoute(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('PUT', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async deleteRoute(id: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default QuoteRoutesModule
