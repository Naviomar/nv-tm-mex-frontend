import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class AuditModule extends FetchFactory<any> {
  private RESOURCE = '/audits'

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getTicketById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tickets/${id}/details`, fetchOptions)
  }

}

export default AuditModule
