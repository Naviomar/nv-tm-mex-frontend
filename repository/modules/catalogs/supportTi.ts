import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
// locals
import FetchFactory from '../../factory'


class SupportTiModule extends FetchFactory<any> {
  private RESOURCE = '/support'

  async sendTicket(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/add-ticket`, fetchOptions)
  }

  async getPaged(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getTicketById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tickets/${id}/details`, fetchOptions)
  }

  async saveTicketColor(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/tickets/${id}/save-color`, fetchOptions)
  }

  async getTicketComments(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tickets/${id}/comments`, fetchOptions)
  }

  async ticketAddComment(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/tickets/${id}/comments/add`, fetchOptions)
  }

  async ticketRemoveComment(id: string, commentId: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/tickets/${id}/comments/${commentId}/delete`, fetchOptions)
  }

  async updateTicketStatus(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/tickets/${id}/update-status`, fetchOptions)
  }

  async addFilesToTicket(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/tickets/${id}/add-files`, fetchOptions)
  }

  async deleteFileFromTicket(id: string, fileId: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/tickets/${id}/delete-file/${fileId}`, fetchOptions)
  }

  async getSupportTicketsDash(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tickets-dashboard`, fetchOptions)
  }

  async migrateTicketToProduction(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/tickets/${id}/migrate-to-production`, fetchOptions)
  }

  async aiChat(query: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify({ query }),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/ai/chat`, fetchOptions)
  }

}

export default SupportTiModule
