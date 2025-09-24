import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class ContainerDelayRatesModule extends FetchFactory<any> {
  private RESOURCE = '/container-delay-rates'

  async getRate(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/rates/${id}/details`, fetchOptions)
  }

  async getRates(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/rates`, fetchOptions)
  }

  async createRates(data: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/rates`, { body: data, ...fetchOptions })
  }

  async updateRate(id: string, data: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/rates/${id}/update`, { body: data, ...fetchOptions })
  }

  async deleteRate(id: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/rates/${id}/delete`, fetchOptions)
  }

}

export default ContainerDelayRatesModule
