import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

class RequestAssistancesModule extends FetchFactory<any> {
  private RESOURCE = '/support-assistance'

  async sendRequestAssist(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/new-request`, fetchOptions)
  }

  async getUserRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/user`, fetchOptions)
  }

  async getRequests(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
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

export default RequestAssistancesModule
