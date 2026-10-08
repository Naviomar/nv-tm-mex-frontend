import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export type DiagnosticStatus = 'ok' | 'warn' | 'fail' | 'skip'

export interface IDiagnosticCheck {
  key: string
  label: string
  category: string
  side_effects: 'read_only' | 'scratch'
  latest: {
    status: DiagnosticStatus
    message: string
    metrics: Record<string, any> | null
    duration_ms: number
    at: string | null
  } | null
}

export interface IDiagnosticResult {
  key: string
  label: string
  category: string
  side_effects?: string
  status: DiagnosticStatus
  message: string
  metrics: Record<string, any>
  duration_ms: number
}

export interface IDiagnosticReport {
  run_id: number | null
  persisted: boolean
  status: DiagnosticStatus
  summary: Record<DiagnosticStatus, number>
  started_at: string
  results: IDiagnosticResult[]
}

export interface IMailScenario {
  key: string
  label: string
  description: string
  template_keys: string[]
  inputs: { name: string; label: string; type: string; required: boolean; help?: string }[]
}

export interface IMailMessage {
  status: string
  mailable: string | null
  notification: string | null
  subject: string | null
  original: { to: string[]; cc: string[]; bcc: string[] }
  delivered_to: string[]
  attachments: { name: string; size_kb: number }[]
  html: string | null
  error?: string
}

export interface IMailTestReport {
  scenario: string
  label: string
  mode: 'dry' | 'send'
  status: DiagnosticStatus
  error: string | null
  delivered_to: string[]
  template_keys: string[]
  messages: IMailMessage[]
  run_id?: number | null
}

export interface IDiagnosticRecipient {
  id: number
  email: string
  name: string | null
  is_active: boolean
}

export interface ITemplateAuditEntry {
  key: string
  type: string
  name: string
  module: string | null
  is_active: boolean
  mailable_class: string | null
  status: 'ok' | 'warn' | 'fail'
  effective_version: { id: number; version_number: number; published_at: string | null } | null
  published_versions: number
  drafts: { id: number; version_number: number; line_id: number | null }[]
  line_overrides: number[]
  scenarios: string[]
  render: { status: string; ms: number; error: string | null } | null
  issues: { level: string; code: string; message: string }[]
}

export interface IProbe {
  key: string
  label: string
  budget: { time_ms: number; queries: number; memory_mb: number; size_kb: number }
}

class DiagnosticsModule extends FetchFactory<any> {
  private RESOURCE = '/diagnostics'

  async status(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/status`, fetchOptions)
  }

  async overview(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/overview`, fetchOptions)
  }

  async run(body: { keys?: string[]; category?: string }, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/run`, { body, ...fetchOptions })
  }

  async runs(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/runs${query}`, fetchOptions)
  }

  async showRun(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/runs/${id}`, fetchOptions)
  }

  async templates(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}/templates${query}`, fetchOptions)
  }

  async probes(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/probes`, fetchOptions)
  }

  async runProbes(body: { keys?: string[] }, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/probes/run`, { body, ...fetchOptions })
  }

  async mailScenarios(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/mail/scenarios`, fetchOptions)
  }

  async runMail(
    body: { scenario: string; mode: 'dry' | 'send'; params?: Record<string, any>; recipients?: string[] },
    fetchOptions?: FetchOptions
  ) {
    return this.call('POST', `${this.RESOURCE}/mail/run`, { body, ...fetchOptions })
  }

  async recipients(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/mail/recipients`, fetchOptions)
  }

  async addRecipient(body: { email: string; name?: string }, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/mail/recipients`, { body, ...fetchOptions })
  }

  async updateRecipient(id: number, body: { name?: string | null; is_active?: boolean }, fetchOptions?: FetchOptions) {
    return this.call('PUT', `${this.RESOURCE}/mail/recipients/${id}`, { body, ...fetchOptions })
  }

  async removeRecipient(id: number, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/mail/recipients/${id}`, fetchOptions)
  }
}

export default DiagnosticsModule
