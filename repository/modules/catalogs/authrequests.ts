import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

class AuthRequestsModule extends FetchFactory<any> {
  private RESOURCE = '/authorization-requests'

  async getUserRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/user`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getRequestsByResource(params = { resource: '', resource_id: 0 }) {
    return this.call('GET', `${this.RESOURCE}/by-resource?resource=${params.resource}&resource_id=${params.resource_id}`)
  }

  async respondRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/respond`, fetchOptions)
  }

  async requestAuthorization(data: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(data)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request`, fetchOptions)
  }

  async getCustomerInvoiceToCancel(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/customer-invoice-to-cancel`, fetchOptions)
  }

  async cancelRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }

  async cancelCustomerInvoice(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/cancel-customer-invoice`, fetchOptions)
  }
}

export default AuthRequestsModule
