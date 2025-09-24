import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

class AuthProcessRequestsModule extends FetchFactory<any> {
  private RESOURCE = '/auth-process-requests'

  async getUserRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/user`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getRequestsByResource(params = { process_name: '', request_key: '' }) {
    return this.call('GET', `${this.RESOURCE}/by-process?process_name=${params.process_name}&request_key=${params.request_key}`)
  }

  async respondRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/respond`, fetchOptions)
  }

  async requestAuthorization(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request`, fetchOptions)
  }

  async cancelRequest(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }

}

export default AuthProcessRequestsModule
