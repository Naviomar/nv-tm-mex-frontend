export type DateOrString = Date | string | null

export interface CatalogOption {
  id: number | string
  name: string
}

export interface ReleaseReportFilters {
  fromDate: DateOrString
  toDate: DateOrString
  dateType: string
  status: string
  consignee_id: number | null
  consignee_group_id: number | null
  executive_id: number | null
  port_id: number | null
  voyage_id: number | null
  releaseToday: boolean
  releaseDateHoy: DateOrString
}

export interface ControlOperacionesFilters {
  fromDate: DateOrString
  toDate: DateOrString
  voyage_id: number | null
  consignee_id: number | null
  consignee_group_id: number | null
  line_id: number | null
  dischargePort_id: number | null
  destinationPort_id: number | null
  ff_id: number | null
  etaMode: string
}

export interface AccountStatementFilters {
  fromDate: DateOrString
  toDate: DateOrString
  voyage_id: number | null
  consignee_id: number | null
  ff_id: number | null
  line_id: number | null
  executive_id: number | null
  release: string | null
  transportType: string | null
  originPort_id: number | null
  loadingPort_id: number | null
  dischargePort_id: number | null
  destinationPort_id: number | null
  etaMode: string
}

export interface ImportRepoFilters {
  fromDate: DateOrString
  toDate: DateOrString
  voyage_id: number | null
  consignee_id: number | null
  consignee_group_id: number | null
  ff_id: number | null
  ff_group_id: number | null
  line_id: number | null
  executive_id: number | null
  release: string | null
  transportType: string | null
  originPort_id: number | null
  loadingPort_id: number | null
  dischargePort_id: number | null
  destinationPort_id: number | null
  etaMode: string
}

export interface ExportRepoFilters {
  fromDate: DateOrString
  toDate: DateOrString
  voyage_id: number | null
  shipper_id: number | null
  consignee_id: number | null
  ff_id: number | null
  line_id: number | null
  executive_id: number | null
  traffic_id: number | null
  transportType: string | null
  originPort_id: number | null
  loadingPort_id: number | null
  dischargePort_id: number | null
  destinationPort_id: number | null
  etaMode: string
}

export interface ExportAccountStatementFilters {
  fromDate: DateOrString
  toDate: DateOrString
  voyage_id: number | null
  shipper_id: number | null
  consignee_id: number | null
  ff_id: number | null
  line_id: number | null
  executive_id: number | null
  traffic_id: number | null
  transportType: string | null
  originPort_id: number | null
  loadingPort_id: number | null
  dischargePort_id: number | null
  destinationPort_id: number | null
  etaMode: string
}

export interface ComparativeTeusFilters {
  report_type: string
  start_year: number
  end_year: number
  year: number
  ejecutivo_id: number | null
  client_id: number | null
  include_offices: boolean
  etaMode: string
}
