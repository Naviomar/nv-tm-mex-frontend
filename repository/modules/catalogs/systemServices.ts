import { type FetchOptions, type $Fetch } from 'ofetch'

import FetchFactory from '../../factory'

class SystemServicesModule extends FetchFactory<any> {
  private RESOURCE = '/system-services'


  async searchServices(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search`, fetchOptions)
  }

  async searchServicesForCustomerPayments(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-for-customer-payments`, fetchOptions)
  }

}

export default SystemServicesModule
