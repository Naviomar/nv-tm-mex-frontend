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

class AirExportModule extends FetchFactory<IReferenciaPagination> {
  private RESOURCE = '/air-export'

  /**
   * Return export reference by pagination
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getReferences(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}`, fetchOptions)
  }

  async getReferenceById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async addNewHouseAwb(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/add-house-awb`, fetchOptions)
  }

  async getAirExportFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/filters`, fetchOptions)
  }

  async getSeaExportCharges(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/charges`, fetchOptions)
  }

  async getChargeCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/charge-catalogs`, fetchOptions)
  }

  async createReferencia(form: any, fetchOptions?: FetchOptions) {
    // console.log('formSeaImport', form)
    const body = objectToFormData(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create`, fetchOptions)
  }

  async updateReference(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async saveSeaExportCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/save-charge`, fetchOptions)
  }

  async deleteSeaExportCharge(id: string, chargeId: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}/delete-charge/${chargeId}`, fetchOptions)
  }

  async sendBookingConfirmation(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/send-booking-confirmation`, fetchOptions)
  }

  async addHouseBl(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/add-house-bl`, fetchOptions)
  }

  async getHouseBlPrint(id: string, houseBlId: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/house-bl/${houseBlId}/print-info`, fetchOptions)
  }

  async savePrintBlInfo(id: string, houseBlId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/house-bl/${houseBlId}/save-print-info`, fetchOptions)
  }

  async previewPrintBl(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      responseType: 'blob',
      ...fetchOptions,

    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/preview-print-bl`, fetchOptions)
  }

  async updateRevalidation(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-revalidation`, fetchOptions)
  }

  async sendRevalidation(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/send-revalidation`, fetchOptions)
  }

  async saveMasterAwbPrintInfo(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/master-awb/save-print-info`, fetchOptions)
  }

  async saveHouseAwbPrintInfo(id: string, houseAwbId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/save-print-info`, fetchOptions)
  }

  async restartMasterAwbPrint(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/master-airwaybill/restart-m-awb`, fetchOptions)
  }

  async restartHouseAwbPrint(id: string, idHouse: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-airwaybill/${idHouse}/restart-h-awb`, fetchOptions)
  }

  async printMasterAwbDraft(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/print/naked-master-airwaybill`, fetchOptions)
  }

  async printMasterAwb(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/print/master-airwaybill`, fetchOptions)
  }

  async printHouseAwbDraft(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/naked-house-airwaybill`, fetchOptions)
  }

  async printHouseAwb(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/house-airwaybill`, fetchOptions)
  }

  async printAwbManifest(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/consolidation-manifest`, fetchOptions)
  }

  async printAwbLetter(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/awb-letter`, fetchOptions)
  }

  async printAwbLetterNaked(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/awb-naked-letter`, fetchOptions)
  }

  async printAwbTags(id: string, houseAwbId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/print/etiquetas`, fetchOptions)
  }

  async printAwbTagsNaked(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/print/etiquetas-naked`, fetchOptions)
  }

  async updateHouseAwbs(id: string, houseAwbId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/house-awb/${houseAwbId}/update-cbms`, fetchOptions)
  }

  async deleteHouseAwb(id: string, houseAwbId: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/remove-house-awb/${houseAwbId}`, fetchOptions)
  }

  async exportXlsxReport(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/export-report-xlsx`, fetchOptions)
  }

}

export default AirExportModule
