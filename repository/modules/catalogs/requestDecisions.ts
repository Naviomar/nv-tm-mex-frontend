import { type FetchOptions } from 'ofetch'

import FetchFactory from '../../factory'

export type RequestKind = 'authorization-request' | 'process-request'

export interface IDecisionOption {
  key: string
  outcome: 'grant' | 'deny'
  label: string
  description: string | null
  editable_window: boolean
  tm2_redirect: string | null
  disabled_reason: string | null
  confirm: string | null
  reason_required: boolean
}

export interface IRequestSummaryRow {
  label: string
  before?: string | null
  after: string | null
  changed?: boolean
  status?: 'ok' | 'pending' | 'info' | null
}

export interface IRequestSummary {
  title: string
  action?: 'add' | 'edit' | 'delete' | string
  reference: { label: string; value: string } | null
  mode: 'diff' | 'details'
  sections: { heading: string; rows: IRequestSummaryRow[] }[]
  warnings: string[]
  notes: string[]
}

export interface IRequestDecision {
  kind: RequestKind
  id: number
  code: string | null
  type_label: string | null
  on_approval: 'execute' | 'window' | 'manual' | null
  state: 'pending' | 'granted' | 'denied' | 'withdrawn'
  decided_by: string | null
  window: {
    expires_at: string
    expires_at_local: string
    timezone: string
    policy: { mode: string; value: number }
    policy_label: string
  } | null
  options: IDecisionOption[]
  summary: IRequestSummary | null
}

export interface IDecideBody {
  option: string
  reason?: string | null
  /** Local wall-clock time ("YYYY-MM-DDTHH:mm") in window.timezone, or ISO with offset. */
  expires_at?: string | null
  temp_permission_enabled?: boolean
  temp_valid_from?: string | null
  temp_valid_until?: string | null
}

/** What the dialog hands back when the chosen option finishes on another TM2 screen. */
export interface IDecisionRedirect {
  option: IDecisionOption
  reason: string
  expiresAt: string | null
  tempPermissionEnabled: boolean
  tempValidFrom: string | null
  tempValidUntil: string | null
}

class RequestDecisionsModule extends FetchFactory<any> {
  private RESOURCE = '/request-decisions'

  async get(kind: RequestKind, id: number, fetchOptions?: FetchOptions): Promise<IRequestDecision> {
    return this.call('GET', `${this.RESOURCE}/${kind}/${id}`, fetchOptions)
  }

  async decide(kind: RequestKind, id: number, body: IDecideBody, fetchOptions?: FetchOptions): Promise<IRequestDecision> {
    return this.call('POST', `${this.RESOURCE}/${kind}/${id}`, { body: JSON.stringify(body), ...fetchOptions })
  }
}

export default RequestDecisionsModule
