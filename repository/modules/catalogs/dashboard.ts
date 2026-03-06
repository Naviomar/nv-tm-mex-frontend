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

  async getSeaCaptureStats(params?: any, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-capture-stats`, { ...fetchOptions, params })
  }

  async getAirCaptureStats(params?: any, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/air-capture-stats`, { ...fetchOptions, params })
  }

}

export default DashboardModule
