import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
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

class ReferenciasModule extends FetchFactory<IReferenciaPagination> {
  private RESOURCE = '/referencias'

  /**
   * Return the currency as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getSeaImportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import`, fetchOptions)
  }

  async getSeaImportFullDetails(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/invoice-details`, fetchOptions)
  }

  async getSeaImportProfit(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/profit`, fetchOptions)
  }

  async getSeaExportProfit(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/profit`, fetchOptions)
  }

  async getSeaImportFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/filters`, fetchOptions)
  }

  async getSeaImportFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/form-catalogs`, fetchOptions)
  }

  async sendSeaImportNotifyArrival(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/send-notify-arrival`, fetchOptions)
  }
  async showProforma(id: string, body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: body,
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/preview-proforma`, fetchOptions)
  }

  async checklist(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/checklist`, fetchOptions)
  }
  async downloadPdf(id: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: '',
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/checklist/download/${id}`, fetchOptions)
  }

  async createSeaImport(form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import`, fetchOptions)
  }

  async getSourceReferencia(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-service/${id}/source-referencia`, fetchOptions)
  }

  async getSeaImportById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}`, fetchOptions)
  }

  async getSeaImportFullDetailById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/full-detail`, fetchOptions)
  }

  async getSeaExportFullDetailById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export/${id}/full-detail`, fetchOptions)
  }

  async updateSeaImport(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update`, fetchOptions)
  }

  async updateMasterBl(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-master-bl`, fetchOptions)
  }

  async saveHouseBl(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/add-house-bl`, fetchOptions)
  }

  async updateHouseBl(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-house-bl`, fetchOptions)
  }

  async saveReleaseInstruction(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/save-release-instruction`, fetchOptions)
  }

  async addMblFiles(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/add-mbl-files`, fetchOptions)
  }

  async removeMblFile(id: string, mbl_id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/sea-import/${id}/remove-mbl-files/${mbl_id}`, fetchOptions)
  }

  async sendRevalidation(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/send-revalidation`, fetchOptions)
  }

  /**
   * Delete a currency by id
   * @param currency
   * @returns
   */
  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getByVoyageDestDemurrageInitDay(voyage_discharge_id: string, fetchOptions?: FetchOptions) {
    return this.call(
      'GET',
      `${this.RESOURCE}/sea-import/voyage-discharge/${voyage_discharge_id}/demurrage-init-day`,
      fetchOptions
    )
  }
  async addReferenceNote(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-reference-note`, fetchOptions)
  }
  async getReferenceNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/reference-notes`, fetchOptions)
  }
  async deleteReferenceNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: form,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-reference-note`, fetchOptions)
  }
  async getNotificationEmails(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/notification-emails`, fetchOptions)
  }

  async getLinePaymentsDetail(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/line-payments`, fetchOptions)
  }

  async getAgentFreightNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/agent-freight-notes`, fetchOptions)
  }

  async saveAgentFreightNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/add-agent-freight-notes`, fetchOptions)
  }

  async deleteFreightNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: form,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-agent-freight-note`, fetchOptions)
  }

  async updateContainer(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-service/${id}/update-container`, fetchOptions)
  }

  async deleteContainer(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-service/${id}/delete-container`, fetchOptions)
  }

  async updateChargeFromReferencia(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-charge${suffix}`, fetchOptions)
  }

  async deleteChargeFromReferencia(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-charge${suffix}`, fetchOptions)
  }

  async updateSellChargeFromReferencia(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-sell-charge${suffix}`, fetchOptions)
  }

  async deleteSellChargeFromReferencia(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-sell-charge${suffix}`, fetchOptions)
  }

  async getLogCharges(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/log-charges`, fetchOptions)
  }

  async checklistInformation(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/checklist-information`, fetchOptions)
  }

  async redoRevalidation(id: string, form?: any, fetchOptions?: FetchOptions) {
    const body = form ? JSON.stringify(form) : undefined
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/redo-revalidation`, fetchOptions)
  }

  async getSeaImportReleaseInfo(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/release-info`, fetchOptions)
  }

  async updateSeaImportReleaseInfo(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-release-info`, fetchOptions)
  }

  async getSeaImportReleaseTransitInfo(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/release-transit-info`, fetchOptions)
  }

  async updateSeaImportReleaseInTransit(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-release-in-transit`, fetchOptions)
  }

  async getSeaImportIntermodalById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/intermodal`, fetchOptions)
  }

  async updateSeaImportIntermodalById(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-intermodal`, fetchOptions)
  }

  async updateSeaImportIntermodalContainerById(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-intermodal-container`, fetchOptions)
  }

  async updateSeaImportIntermodalAllContainers(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-intermodal-all-containers`, fetchOptions)
  }

  async deleteSeaImportIntermodalContainerById(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-intermodal-container`, fetchOptions)
  }

  async sendSeaImportIntermodalNotifications(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/send-intermodal-notifications`, fetchOptions)
  }

  async sendIntermodalRailNoty(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/send-rail-noty`, fetchOptions)
  }

  async intermodalUploadProofDelivery(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/upload-proof-delivery`, fetchOptions)
  }

  async deleteReference(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-reference`, fetchOptions)
  }

  async getSeaServiceCustomerInvoices(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-service/${id}/customer-invoices`, fetchOptions)
  }

  async getSeaImportRefunds(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/refunds`, fetchOptions)
  }

  async updateSeaImportDemurrageDays(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-demurrage-days`, fetchOptions)
  }

  async getChecklistRevalidation(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `/checklist-revalidation/${id}/referencia`, fetchOptions)
  }

  async getChecklistRevalidationIsOk(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `/checklist-revalidation/${id}/is-ok`, fetchOptions)
  }

  async addCartaEncomienda(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/add-carta-encomienda`, fetchOptions)
  }

  async removeCartaEncomienda(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/remove-carta-encomienda`, fetchOptions)
  }

  async sendChecklistRevalidation(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/checklist-revalidation/send-notify`, fetchOptions)
  }

  async updateSeaImportRebate(id: any, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-rebate`, fetchOptions)
  }

  async updateLockedArrivalVoyage(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/update-locked-arrival-voyage`, fetchOptions)
  }

  async updateLockedDepartureVoyage(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export/${id}/update-locked-departure-voyage`, fetchOptions)
  }

  async exportImportXlsxReport(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/export-import-report-xlsx`, fetchOptions)
  }

  async upsertSeaImportBuyCharges(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/upsert-buy-charges`, fetchOptions)
  }

  async deleteSeaImportBuyCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-buy-charge`, fetchOptions)
  }

  async upsertSeaImportSellCharges(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/upsert-sell-charges`, fetchOptions)
  }

  async deleteSeaImportSellCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-sell-charge`, fetchOptions)
  }

  async upsertSeaImportLocalCharges(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/upsert-local-charges`, fetchOptions)
  }

  async deleteSeaImportLocalCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = JSON.stringify(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import/${id}/delete-local-charge`, fetchOptions)
  }
}

export default ReferenciasModule
