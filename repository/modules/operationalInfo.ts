import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IOperationalDailyReport {
  id: number
  report_date: string
  total_invoices_sent: number | null
  clients_sent_count: number | null
  clients_sent: string[] | null
  incidents_detected: string | null
  corrections_made: string | null
  pending: string | null
  observations: string | null
  references_reviewed: number | null
  references_with_inconsistencies: number | null
  references_corrected: number | null
  references_pending_validation: number | null
  risks_identified: string | null
  extra: Record<string, any> | null
  status: 'draft' | 'submitted'
  creator?: { id: number; name: string } | null
  updater?: { id: number; name: string } | null
  created_at?: string
  updated_at?: string
}

export interface IOperationalDashboard {
  usage: Record<string, any>
  mail_health: {
    sent_today: number
    no_recipient_today: number
    total_today: number
    total_last_hour: number
    by_mailable_today: Record<string, number>
  }
  open_alerts: {
    total_unresolved: number
    missing_recipient: number
  }
}

class OperationalInfoModule extends FetchFactory<any> {
  private RESOURCE = '/operational-info'

  async dashboard(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/dashboard${query}`, fetchOptions)
  }

  async reportsHistory(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/reports${query}`, fetchOptions)
  }

  async showReport(date: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/reports/${date}`, fetchOptions)
  }

  async suggestedValues(date: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/reports/${date}/suggested-values`, fetchOptions)
  }

  async storeOrUpdateReport(date: string, payload: Record<string, any>, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/reports/${date}`, { body: payload, ...fetchOptions })
  }
}

export default OperationalInfoModule
