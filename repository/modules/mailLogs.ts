import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IMailLogAddress {
  address: string
  name?: string | null
}

export interface IMailLog {
  id: number
  mailable_class: string | null
  mailable_short: string | null
  notification_class: string | null
  notification_short: string | null
  subject: string | null
  to: IMailLogAddress[]
  cc: IMailLogAddress[]
  bcc: IMailLogAddress[]
  from: IMailLogAddress[]
  has_recipient: boolean
  status: 'sent' | 'no_recipient'
  message_id: string | null
  triggered_by: { id: number; name: string } | null
  related_type: string | null
  related_id: number | null
  payload?: Record<string, any> | null
  occurred_at: string
  created_at: string
}

export interface IMailLogMetrics {
  sent_today: number
  no_recipient_today: number
  total_today: number
  total_last_hour: number
  by_mailable_today: Record<string, number>
}

class MailLogsModule extends FetchFactory<any> {
  private RESOURCE = '/mail-logs'

  async index(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}${query}`, fetchOptions)
  }

  async show(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async metrics(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/metrics`, fetchOptions)
  }

  async exportExcel(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/export${query}`, {
      responseType: 'blob',
      ...fetchOptions,
    })
  }
}

export default MailLogsModule
