import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ControlOperacionesFilters {
  dateRange?: string[]
  voyage?: number | null
  line?: number | null
  consignee?: number | null
  consignee_group?: number | null
  dischargePort?: number | null
  destinationPort?: number | null
  ff?: number | null
}

export interface ControlOperacionesRequest {
  useLegacy: boolean
  useNew: boolean
  filters: ControlOperacionesFilters
}

class ControlOperacionesModule extends FetchFactory<any> {
  private readonly RESOURCE = '/reports/control-operaciones'

  async exportExcel(data: ControlOperacionesRequest, fetchOptions?: FetchOptions) {
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

export default ControlOperacionesModule
