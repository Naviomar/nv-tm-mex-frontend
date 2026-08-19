import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ExportAccountStatementFilters {
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
  transportType?: string | null
  pagoLinea?: boolean
}

export interface ExportAccountStatementRequest {
  useLegacy: boolean
  useNew: boolean
  filters: ExportAccountStatementFilters
}

export interface ExportAccountStatementReportItem {
  id: number
  vessel: string
  voyage: string
  traffic: string
  line: string
  transport: string
  transshipment: string
  dateTB: string
  etd: string
  reference: string
  origin: string
  /** Export's billing customer — called "Shipper" in the UI even though the
   * underlying relation is Referencia.consignee_id / legacy CAT_SCNF. */
  shipper: string
  /** The actual foreign receiving party — Referencia.shipper_id / legacy id_consignee. */
  consignee: string
  bl_master: string
  bl_house: string
  date: string
  ff: string
  condition: string
  m3: number
  kgs: number
  teus: number
  sell_rate: number
  acobrar: number
  pendiente: number
  executive: string
  destination: string
  pp_cc: string
  rls: number
  origin_port: string
  loading: string
  discharge: string
  destination_port: string
  /** Cost/profit fields below are only present when the user has the sea-export-profit permission. */
  buy_rate?: number
  cargos_usd?: number
  total_dem?: number
  pagado_usd?: number
  profit_gral?: number
  cargo_profit?: number
  demurrage_profit?: number
  real_profit?: number
  profit_mxp?: number
  programado?: number
  pagado_linea?: number
}

class ExportAccountStatementModule extends FetchFactory<any> {
  private RESOURCE = '/reports/export-account-statement'

  async getReport(data: ExportAccountStatementRequest, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: data,
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async exportExcel(data: ExportAccountStatementRequest, fetchOptions?: FetchOptions) {
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

  async getCatalogByType(type: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs/${type}`, fetchOptions)
  }
}

export default ExportAccountStatementModule
