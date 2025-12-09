import { type FetchOptions, type $Fetch } from 'ofetch'

import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

class LinePaymentsModule extends FetchFactory<any> {
  private RESOURCE = '/line-payments'

  /**
   * Return the currency as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getSchedules(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/schedules`, fetchOptions)
  }

  async getLineInvoices(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/invoices`, fetchOptions)
  }

  async getLineInvoiceById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/invoices/${id}/details`, fetchOptions)
  }

  async downloadExcel(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/${id}/download-excel`, fetchOptions)
  }

  async searchBlsForRealeasePayment(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-bls-for-release-payment`, fetchOptions)
  }

  async exportBlsForRealeasePayment(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/export-bls-for-release-payment`, fetchOptions)
  }

  async saveScheduleFile(data: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(data)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/schedules`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/schedules/catalogs`, fetchOptions)
  }

  async sendEmailForSelected(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/schedules/send-email`, fetchOptions)
  }

  async searchSeaReferences(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/invoices/search-sea-references`, fetchOptions)
  }

  async addLineInvoice(data: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(data)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/invoices/capture`, fetchOptions)
  }

  async updateLineInvoice(data: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(data)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/invoices/update`, fetchOptions)
  }

  async removeLineInvoiceRef(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/invoices/remove-ref`, fetchOptions)
  }

  async getAttachments(id: string | number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/get-attachments`, fetchOptions)
  }

  async addAttachment(id: string | number, data: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(data)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-attachment`, fetchOptions)
  }

  async removeAttachment(data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/remove-attachment`, fetchOptions)
  }

  // --- NUEVO MÉTODO AGREGADO ---
  async delete(id: string | number, fetchOptions?: FetchOptions) {
    // Ajusta la URL si tu backend usa otra ruta, por ejemplo: `${this.RESOURCE}/${id}`
    return this.call('DELETE', `${this.RESOURCE}/invoices/${id}`, fetchOptions)
  }


}

export default LinePaymentsModule
