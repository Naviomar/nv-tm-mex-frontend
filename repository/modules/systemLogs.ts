import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface ISystemLog {
  id: number
  type: string
  level: string
  message: string
  user: { id: number; name: string } | null
  user_name?: string
  ip_address?: string
  user_agent?: string
  request_id?: string
  job_id?: string
  queue?: string
  payload?: Record<string, any> | null
  summary?: string
  occurred_at: string
  created_at: string
}

export interface ISystemLogMetrics {
  errors_today: number
  critical_today: number
  warnings_today: number
  jobs_failed_today: number
  http_errors_today: number
  total_today: number
  total_last_hour: number
  by_type_today: Record<string, number>
  by_level_today: Record<string, number>
}

export interface IOnlineUser {
  id: number
  name: string
  email: string
  avatar?: string | null
}

class SystemLogsModule extends FetchFactory<any> {
  private RESOURCE = '/system-logs'

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

  async onlineUsers(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/online-users`, fetchOptions)
  }

  async exportExcel(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams({ ...params, format: 'excel' }).toString() : '?format=excel'
    return this.call('GET', `${this.RESOURCE}/export${query}`, {
      responseType: 'blob',
      ...fetchOptions,
    })
  }

  async exportPdf(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams({ ...params, format: 'pdf' }).toString() : '?format=pdf'
    return this.call('GET', `${this.RESOURCE}/export${query}`, {
      responseType: 'blob',
      ...fetchOptions,
    })
  }
}

export default SystemLogsModule
