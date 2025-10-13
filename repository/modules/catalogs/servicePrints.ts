import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class ServicePrintsModule extends FetchFactory<any> {
  private RESOURCE = '/customer-service-prints'

  async getAll(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/get-all`, fetchOptions)
  }

  async getByCustomerId(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/get-by-customer/${id}/all-prints`, fetchOptions)
  }
}

export default ServicePrintsModule
