import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ReleaseReportsFilters {
  dateRange?: string[]
  dateType?: string
  status?: string
  consignee?: number | null
  consignee_group?: number | null
  executive?: number | null
  voyage?: number | null
  port?: number | null
  releaseToday?: boolean
  releaseDateHoy?: string
}

export interface ReleaseReportsRequest {
  type: string
  useLegacy: boolean
  useNew: boolean
  filters: ReleaseReportsFilters
}

class ReleaseReportsModule extends FetchFactory<any> {
  private readonly RESOURCE = '/reports/releases'

  async exportExcel(data: ReleaseReportsRequest, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: data,
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/export-excel`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }
}

export default ReleaseReportsModule
