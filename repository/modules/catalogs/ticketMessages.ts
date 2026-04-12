import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export type TicketType = 'authorization-request' | 'process-request' | 'support-assistance'

export interface TicketMessageFile {
  id: number
  ticket_message_id: number
  file_path: string
  original_name: string
  mime_type: string | null
  size: number | null
}

export interface TicketMessageEdit {
  id: number
  ticket_message_id: number
  body: string
  edited_by: number
  created_at: string
}

export interface TicketMessage {
  id: number
  ticketable_type: string
  ticketable_id: number
  sender_id: number
  sender?: { id: number; name: string; email: string }
  body: string
  is_internal: boolean
  read_at: string | null
  files: TicketMessageFile[]
  edits?: TicketMessageEdit[]
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

class TicketMessagesModule extends FetchFactory<any> {
  private RESOURCE = '/ticket-messages'

  async getMessages(type: TicketType, id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${type}/${id}`, fetchOptions)
  }

  async sendMessage(
    type: TicketType,
    id: number,
    data: { body?: string; is_internal?: boolean; files?: File[] },
    fetchOptions?: FetchOptions,
  ) {
    const form = new FormData()
    if (data.body) form.append('body', data.body)
    form.append('is_internal', data.is_internal ? '1' : '0')
    if (data.files?.length) {
      data.files.forEach((f) => form.append('files[]', f))
    }
    return this.call('POST', `${this.RESOURCE}/${type}/${id}`, { body: form, ...fetchOptions })
  }

  async markRead(type: TicketType, id: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${type}/${id}/mark-read`, fetchOptions)
  }

  async getUnreadCount(type: TicketType, id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${type}/${id}/unread-count`, fetchOptions)
  }

  async editMessage(messageId: number, body: string, fetchOptions?: FetchOptions) {
    return this.call('PATCH', `${this.RESOURCE}/message/${messageId}`, { body: { body }, ...fetchOptions })
  }

  async deleteMessage(messageId: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/message/${messageId}`, fetchOptions)
  }
}

export default TicketMessagesModule
