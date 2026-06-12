import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ImportRepoFilters {
  dateRange?: string[]
  voyage?: number | null
  line?: number | null
  executive?: number | null
  consignee?: number | null
  ff?: number | null
  originPort?: number | null
  loadingPort?: number | null
  dischargePort?: number | null
  destinationPort?: number | null
  release?: string | null
  transportType?: string | null
}

export interface ImportRepoRequest {
  useLegacy: boolean
  useNew: boolean
  filters: ImportRepoFilters
}

export interface ImportRepoReportItem {
  id: number
  vessel: string
  voyage: string
  traffic: string
  line: string
  transport: string
  transshipment: string
  dateTB: string
  etd: string
  eta: string
  reference: string
  origin: string
  shipper: string
  customer: string
  bl_master: string
  bl_house: string
  date: string
  ff: string
  condition: string
  m3: number
  kgs: number
  container: string
  type: string
  teus: number
  profit_usd: number
  profit_mxp: number
  executive: string
  destination: string
  buy_rate: number
  pp_cc: string
  status_buy_rate: string
  origin_port: string
  loading: string
  discharge: string
  destination_port: string
  consignee_master_bl: string
  purchase_order: string
}

class ImportRepoModule extends FetchFactory<any> {
  private RESOURCE = '/reports/import-repo'

  async getReport(data: ImportRepoRequest, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: data,
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async exportExcel(data: ImportRepoRequest, fetchOptions?: FetchOptions) {
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
}

export default ImportRepoModule
