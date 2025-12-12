import { type FetchOptions, type $Fetch } from 'ofetch'

import objectToFormData from '~/utils/toFormData'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IReferenciaPagination = {
  data: IReferencia[]
  total: number
  last_page: number
  per_page: number
  current_page: number
  page: number
  total_pages: number
  links: {
    previous: string
    next: string
  }
}
type IReferencia = {
  id: number
  name: string
  reference_year: string
  impoExpo: string
  country_code: string
  consecutive: string
  voyage_id: string
  sea_traffic_id: string
  origin: string
  pol_id: string
  pod_id: string
  destination: string
  service_contract: string
  consignee_id: string
  freight_forwarder_id: string
  shipper_id: string
}

class DemurragesModule extends FetchFactory<any> {
  private RESOURCE = '/demurrages'

  /**
   * Return the currency as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getSeaImportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import-references`, fetchOptions)
  }

  async getSeaImportById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import-references/${id}`, fetchOptions)
  }

  async saveReferenciaFreeDays(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/update-free-days`, fetchOptions)
  }

  async saveContainersCalculation(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/calculate-containers`, fetchOptions)
  }

  async saveLinePayment(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/line-payment`, fetchOptions)
  }

  async saveDemurrageNote(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/notes`, fetchOptions)
  }

  async showPdfCut(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import-references/${id}/cut-pdf`, fetchOptions)
  }

  async sendEmailDemurrageCut(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/send-email-cut`, fetchOptions)
  }

  async requestDiscount(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/set-demurrage-discount`, fetchOptions)
  }

  async exportXlsxReport(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/export-report-xlsx`, fetchOptions)
  }

  async refreshContainerRates(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/refresh-container-rates`, fetchOptions)
  }

  async getConfiguredFreeDays(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import-references/${id}/configured-free-days`, fetchOptions)
  }

  async syncFreeDaysFromConfig(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/sync-free-days`, fetchOptions)
  }

  // Rate Overrides
  async getRateOverrides(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import-references/${id}/rate-overrides`, fetchOptions)
  }

  async createRateOverride(id: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/rate-overrides`, fetchOptions)
  }

  async updateRateOverride(id: string, overrideId: string, data: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(data),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-references/${id}/rate-overrides/${overrideId}/update`, fetchOptions)
  }

  async deleteRateOverride(id: string, overrideId: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/sea-import-references/${id}/rate-overrides/${overrideId}`, fetchOptions)
  }
}

export default DemurragesModule
