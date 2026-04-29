import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

class QuotesModule extends FetchFactory<any> {
  private RESOURCE = '/quotes'

  async getQuotes(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getQuoteById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async createQuote(form: any, fetchOptions?: FetchOptions) {
    return this.call('POST', this.RESOURCE, {
      body: form,
      ...fetchOptions
    })
  }

  async updateQuote(id: string, form: any, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/${id}`, {
      body: form,
      ...fetchOptions
    })
  }

  async uploadCostsPdf(id: string, formData: FormData, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/upload-costs-pdf`, {
      body: formData,
      ...fetchOptions
    })
  }

  async requestAuthorization(id: string, form: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/request-authorization`, {
      body: form,
      ...fetchOptions
    })
  }

  async registerMbl(id: string, form: any, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/register-mbl`, {
      body: form,
      ...fetchOptions
    })
  }

  async complete(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/complete`, fetchOptions)
  }

  async sendEmail(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/send-email`, fetchOptions)
  }
}

export default QuotesModule
