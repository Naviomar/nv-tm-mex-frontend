import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class ServiceChargeLogsModule extends FetchFactory<any> {
  private RESOURCE = '/services/charge-logs'

  async getByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/by-service`, fetchOptions)
  }

}

export default ServiceChargeLogsModule
