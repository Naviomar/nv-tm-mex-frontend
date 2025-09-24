import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'


class ExchangeRateModule extends FetchFactory<any> {
  private RESOURCE = '/core/exchange-rates'
  private RESOURCE2 = '/exchange-rates'

  async getPaged(fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE2}/paged`, fetchOptions)
  }
  async getTodayRates(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', `${this.RESOURCE}/today`, fetchOptions)
  }

}

export default ExchangeRateModule
