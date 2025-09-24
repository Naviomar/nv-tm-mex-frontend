import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'

class ServicePaymentsModule extends FetchFactory<any> {
  private RESOURCE = '/service-payments'

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-serv-payment`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-service-payment`, fetchOptions)
  }

}

export default ServicePaymentsModule
