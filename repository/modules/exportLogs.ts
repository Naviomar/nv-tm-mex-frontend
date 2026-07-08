import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IExportLog {
  id: number
  export_class: string
  label: string
  user: { id: number; name: string } | null
  filters: Record<string, any> | null
  file_name: string
  file_size: number
  generated_at: string
}

class ExportLogsModule extends FetchFactory<any> {
  private RESOURCE = '/export-logs'

  async index(params?: Record<string, any>, fetchOptions?: FetchOptions) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.call('GET', `${this.RESOURCE}${query}`, fetchOptions)
  }

  async download(id: number, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/download`, fetchOptions)
  }
}

export default ExportLogsModule
