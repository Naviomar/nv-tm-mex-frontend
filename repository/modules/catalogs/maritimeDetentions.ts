import { type FetchOptions, type $Fetch } from 'ofetch'
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

class MaritimeDetentionsModule extends FetchFactory<any> {
  private RESOURCE = '/maritime/detentions'

  async searchServicesToRequest(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request-payment/search-services`, fetchOptions)
  }

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getReqDetentionPdf(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${id}/preview-line-detention-pdf`, fetchOptions)
  }

  async sendNotifyToPay(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/send-notify-to-pay`, fetchOptions)
  }

  async cancelDetentionRequest(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/cancel-detention-request`, fetchOptions)
  }

  async requestDetentionPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request-payment`, fetchOptions)
  }

  async showPartyInvoicePdf(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${id}/preview-party-pdf`, fetchOptions)
  }

  async uploadAttachments(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/upload-attachments`, fetchOptions)
  }

  async removeAttachment(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/remove-attachment`, fetchOptions)
  }

  async cancelPartyInvoice(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/cancel`, fetchOptions)
  }

  async updateNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-notes`, fetchOptions)
  }

  async cancelSupReqPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cancel`, fetchOptions)
  }

  async updateBankInfo(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-bank-info`, fetchOptions)
  }

  async searchSupplierCfdis(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-supplier-cfdis`, fetchOptions)
  }

  async linkSupplierCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/link-supplier-cfdi`, fetchOptions)
  }

  async unlinkSupplierCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/unlink-supplier-cfdi`, fetchOptions)
  }

}

export default MaritimeDetentionsModule
