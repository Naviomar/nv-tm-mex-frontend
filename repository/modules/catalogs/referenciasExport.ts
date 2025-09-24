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

class ReferenciasExportModule extends FetchFactory<IReferenciaPagination> {
  private RESOURCE = '/referencias'

  /**
   * Return export reference by pagination
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getSeaExportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export`, fetchOptions)
  }

  async getReferenciaById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}`, fetchOptions)
  }

  async getSeaExportFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/filters`, fetchOptions)
  }

  async getSeaExportCharges(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/charges`, fetchOptions)
  }

  async getChargeCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/charge-catalogs`, fetchOptions)
  }

  async createReferencia(form: any, fetchOptions?: FetchOptions) {
    // console.log('formSeaImport', form)
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export`, fetchOptions)
  }

  async updateReference(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/update`, fetchOptions)
  }

  async uploadMasterBlFile(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/upload-master-bl`, fetchOptions)
  }

  async uploadHouseBlFile(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/upload-house-bl`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/form-catalogs`, fetchOptions)
  }

  async saveSeaExportCharge(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }

    if (withPermission) {
      return this.call('POST', `${this.RESOURCE}/sea-export/${id}/save-charge-with-permission`, fetchOptions)
    } else {
      return this.call('POST', `${this.RESOURCE}/sea-export/${id}/save-charge`, fetchOptions)
    }

  }

  async deleteSeaExportCharge(id: string, chargeId: string, withPermission: boolean, fetchOptions?: FetchOptions) {
    if (withPermission) {
      return this.call('DELETE', `${this.RESOURCE}/sea-export/${id}/delete-charge/${chargeId}/with-permission`, fetchOptions)
    } else {
      return this.call('DELETE', `${this.RESOURCE}/sea-export/${id}/delete-charge/${chargeId}`, fetchOptions)
    }
  }

  async sendBookingConfirmation(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/send-booking-confirmation`, fetchOptions)
  }

  async saveReleaseLine(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/save-release-line`, fetchOptions)
  }

  async saveReleaseTm(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/save-release-tm`, fetchOptions)
  }

  async getReleasesTmLine(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/releases-tm-line`, fetchOptions)
  }

  async getAlerts(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/alerts`, fetchOptions)
  }

  async sendAlertDraftBl(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/send-alert-draft-bl`, fetchOptions)
  }

  async sendPreAlert(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/send-pre-alert`, fetchOptions)
  }

  async sendAlertFinal(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/send-alert-final`, fetchOptions)
  }

  async getVoyageDestinationZarpe(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/voyage-destination-zarpe`, fetchOptions)
  }

  async toggleSailed(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/toggle-sailed`, fetchOptions)
  }

  async addHouseBl(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/add-house-bl`, fetchOptions)
  }

  async removeHouseBl(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/remove-house-bl`, fetchOptions)
  }

  async getHouseBlPrint(id: string, houseBlId: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/house-bl/${houseBlId}/print-info`, fetchOptions)
  }

  async savePrintBlInfo(id: string, houseBlId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/house-bl/${houseBlId}/save-print-info`, fetchOptions)
  }

  async saveDetentions(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/save-detentions`, fetchOptions)
  }

  async updateDetention(id: string, refContainerId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/ref-container/${refContainerId}/update-detentions`, fetchOptions)
  }

  async previewPrintBl(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      responseType: 'blob',
      ...fetchOptions,

    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/preview-print-bl`, fetchOptions)
  }

  async syncToCl(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/sync-to-cl`, fetchOptions)
  }

}

export default ReferenciasExportModule
