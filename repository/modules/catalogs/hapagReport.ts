import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

class HapagReportModule extends FetchFactory<any> {
  private RESOURCE = '/hapag-report'

  async getConfig(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/config`, fetchOptions)
  }

  async updateConfig(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/config`, fetchOptions)
  }

  async triggerTest(fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/config/test`, fetchOptions)
  }
}

export default HapagReportModule
