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

export interface SigaStatus {
  linked: boolean
  siga_ticket_id: string | null
  sync_status: string | null
  last_synced_at: string | null
}

export interface SigaSyncResult {
  linked: boolean
  new_messages?: number
  siga_ticket_id?: string
  error?: string
}

export interface LiveChat {
  ticket_type: TicketType
  ticket_id: number
  label: string
  requester: string | null
  unread_count: number
  last_message: string
  last_message_at: string
  action_url: string
}

class TicketMessagesModule extends FetchFactory<any> {
  private RESOURCE = '/ticket-messages'

  async getLiveChats(fetchOptions?: FetchOptions): Promise<LiveChat[]> {
    return this.call('GET', `${this.RESOURCE}/live-chats`, fetchOptions)
  }

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

  async getSigaStatus(type: TicketType, id: number, fetchOptions?: FetchOptions): Promise<SigaStatus> {
    return this.call('GET', `${this.RESOURCE}/${type}/${id}/siga-status`, fetchOptions)
  }

  async syncSiga(type: TicketType, id: number, fetchOptions?: FetchOptions): Promise<SigaSyncResult> {
    return this.call('POST', `${this.RESOURCE}/${type}/${id}/siga-sync`, fetchOptions)
  }

  async deleteMessage(messageId: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/message/${messageId}`, fetchOptions)
  }
}

export default TicketMessagesModule
