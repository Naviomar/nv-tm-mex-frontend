import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ExportRepoFilters {
  dateRange?: string[]
  voyage?: number | null
  line?: number | null
  executive?: number | null
  consignee?: number | null
  ff?: number | null
  traffic?: number | null
  originPort?: number | null
  loadingPort?: number | null
  dischargePort?: number | null
  destinationPort?: number | null
  transportType?: string | null
}

export interface ExportRepoRequest {
  useLegacy: boolean
  useNew: boolean
  filters: ExportRepoFilters
}

export interface ExportRepoReportItem {
  id: number
  vessel: string
  voyage: string
  traffic: string
  line: string
  transport: string
  etd: string
  eta: string
  reference: string
  origin: string
  customer: string
  bl_master: string
  bl_house: string
  date: string
  ff: string
  condition: string
  m3: number
  kgs: number
  teus: number
  profit_usd: number
  executive: string
  destination: string
  buy_rate: number
  pp_cc: string
  origin_port: string
  loading: string
  discharge: string
  destination_port: string
  bkg_line: string
  positioning: string
  docs_closing: string
  nomination: string
}

class ExportRepoModule extends FetchFactory<any> {
  private RESOURCE = '/reports/export-repo'

  async getReport(data: ExportRepoRequest, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: data,
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async exportExcel(data: ExportRepoRequest, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: data,
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/export-excel`, fetchOptions)
  }

  async getVoyages(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/voyages`, fetchOptions)
  }

  async getLines(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/lines`, fetchOptions)
  }

  async getExecutives(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/executives`, fetchOptions)
  }

  async getConsignees(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/consignees`, fetchOptions)
  }

  async getFreightForwarders(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/freight-forwarders`, fetchOptions)
  }

  async getPorts(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/ports`, fetchOptions)
  }

  async getTraffics(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/traffics`, fetchOptions)
  }
}

export default ExportRepoModule
