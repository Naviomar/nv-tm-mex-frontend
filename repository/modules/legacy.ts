import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

class LegacyModule extends FetchFactory<any> {
  private RESOURCE = '/legacy'

  async searchVoyages(search: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search-voyages`, {
      ...fetchOptions,
      query: { search },
    })
  }

  async findMatchingVessel(name: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/find-matching-vessel`, {
      ...fetchOptions,
      query: { name },
    })
  }

  async searchImpoMar(search: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search-impo-mar`, {
      ...fetchOptions,
      query: { search },
    })
  }

  async getImpoMarDetail(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/impo-mar/${id}`, fetchOptions)
  }

  async searchExpoMar(search: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search-expo-mar`, {
      ...fetchOptions,
      query: { search },
    })
  }

  async getExpoMarDetail(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/expo-mar/${id}`, fetchOptions)
  }

  async checkLegacyReference(referencia: string, type: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/check-legacy-reference`, {
      ...fetchOptions,
      query: { referencia, type },
    })
  }
}

export default LegacyModule
