import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
import FetchFactory from '../../factory'

class FfNotesModule extends FetchFactory<any> {
  private RESOURCE = '/ff-notes'

  async toggleLockFreightNote(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/toggle-lock-note`, fetchOptions)
  }

  async getSoaCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/soa/catalogs`, fetchOptions)
  }

  async getPaymentById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/ff-payments/${id}/details`, fetchOptions)
  }

  async paymentUnlinkNoteByFfNotePaymentId(ffPaymentId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/ff-payments/${ffPaymentId}/unlink-note`, fetchOptions)
  }

  async generatePayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/generate-payment`, fetchOptions)
  }

  async deletePayment(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/ff-payments/${id}/delete`, fetchOptions)
  }

  async getFfNoteByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/by-service`, fetchOptions)
  }

  async searchFfNoteForReqPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-ff-note-for-req-payment`, fetchOptions)
  }

  async reqPaymentLinkNote(ffPaymentId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/ff-payments/${ffPaymentId}/link-note`, fetchOptions)
  }

  async saveFfNotes(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/add-service-notes`, fetchOptions)
  }

  async deleteFfNote(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/delete-ff-note`, fetchOptions)
  }

  async updateFfNoteNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-notes`, fetchOptions)
  }

  async getFfNotePdf(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/download-pdf`, fetchOptions)
  }

  async updateLockingStatus(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-locking-status`, fetchOptions)
  }

  async previewFfNotesPdf(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/preview-ffs-pdf`, fetchOptions)
  }

  async previewFfNotesExcel(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/preview-ffs-xlsx`, fetchOptions)
  }

  async sendEmailFfPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/send-email-ff-payment`, fetchOptions)
  }

  async downloadFfPaymentPdf(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/payment/${id}/download-pdf`, fetchOptions)
  }

  async downloadFfPaymentExel(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/payment/${id}/download-excel`, fetchOptions)
  }

  async splitFfNotesFromPayment(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/payment/${id}/split-ff-notes-from-payment`, fetchOptions)
  }

  async uploadFfNoteAttachment(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/upload-attachment`, fetchOptions)
  }

  async unlockFfNote(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/unlock-note`, fetchOptions)
  }

  async generateFfReport(fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/generate-ff-report`, fetchOptions)
  }

  async exportXlsxReport(fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/export-xlsx-report`, fetchOptions)
  }
}

export default FfNotesModule
