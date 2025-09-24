import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

class AdvancePaymentModule extends FetchFactory<any> {
  private RESOURCE = '/advance-payments'

  /**
   * Return the sea regions as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getPaged(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getReqAdvPayPdf(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${id}/req-adv-pay-pdf`, fetchOptions)
  }

  async searchForServices(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-services-buy-concepts`, fetchOptions)
  }

  async searchSellConceptsForServices(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-services-sell-concepts`, fetchOptions)
  }

  async searchBuyConceptsForServices(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-services-buy-concepts`, fetchOptions)
  }

  async cancelAdvRequest(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/cancel`, fetchOptions)
  }

  async updateNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-notes`, fetchOptions)
  }

  async updateBankInfo(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-bank-info`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async requestAdvancePayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request-adv-payment`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async cancelAdvPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cancel`, fetchOptions)
  }
}

export default AdvancePaymentModule
