import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class DashboardModule extends FetchFactory<any> {
  private RESOURCE = '/dashboard'

  async getMaritimeDash(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/maritime-global-dash`, fetchOptions)
  }

  async getAirDash(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/air-global-dash`, fetchOptions)
  }

  async getBillingDash(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/billing-global-dash`, fetchOptions)
  }

}

export default DashboardModule
