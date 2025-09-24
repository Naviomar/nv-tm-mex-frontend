import { type FetchOptions } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
import FetchFactory from '../../factory'

class SupplierReqPaymentsModule extends FetchFactory<any> {
  private RESOURCE = '/supplier-req-payments'

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getReqPaymentPdf(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${id}/preview-sup-req-pay-pdf`, fetchOptions)
  }

  async updateNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-notes`, fetchOptions)
  }

  async sendSupReqPayNoty(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/send-sup-req-pay-noty`, fetchOptions)
  }

  async updateExchangeRate(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-exchange-rate`, fetchOptions)
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

  async deleteSupReqInvoice(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/req-invoice/${form.id}/unlink`, fetchOptions)
  }

  async reqSupPaymentLinkInvoice(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/req-invoice/${form.supplier_invoice_id}/link`, fetchOptions)
  }

}

export default SupplierReqPaymentsModule
