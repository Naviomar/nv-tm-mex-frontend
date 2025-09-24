import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

class InvoicesModule extends FetchFactory<any> {
  private RESOURCE = '/invoices'


  async getAirImportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/air-import`, fetchOptions)
  }

  async getAirExportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/air-export`, fetchOptions)
  }

  async getSeaImportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import`, fetchOptions)
  }

  async getSeaExportReferencias(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-export`, fetchOptions)
  }

  async createSeaImportInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-sea-import`, fetchOptions)
  }

  async createAirInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-air-invoice`, fetchOptions)
  }

  async addChargeToReferencia(form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }

    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/add-charge-to-referencia${suffix}`, fetchOptions)
  }

  async addChargeToProforma(form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }

    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/add-charge-to-proforma${suffix}`, fetchOptions)
  }

  async updateChargeProforma(form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/update-charge-proforma${suffix}`, fetchOptions)
  }

  async deleteChargeProforma(form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    const suffix = withPermission ? '-with-permission' : ''
    return this.call('POST', `${this.RESOURCE}/delete-charge-proforma${suffix}`, fetchOptions)
  }

  async getServiceAvailableCharges(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/service-available-charges`, fetchOptions)
  }

  async createDemurrageInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-demurrage`, fetchOptions)
  }

  async createConsigneeFreeformatInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-consignee-free-format`, fetchOptions)
  }

  async deleteConsigneeProforma(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/delete-consignee-proforma`, fetchOptions)
  }

  async updateChargeCfdiName(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/invoice-charge/update-cfdi-name`, fetchOptions)
  }

  async getInvoicesExport(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tm-export`, fetchOptions)
  }

  async exportDataXlsx(fetchOptions?: FetchOptions) {
    return this.call("GET", `${this.RESOURCE}/export-xlsx`, fetchOptions);
  }

  async fetchPendingChargesByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-services-pending-charges`, fetchOptions)
  }

  async createInvoiceByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/create-invoice-by-service`, fetchOptions)
  }

  async convertProformaToInvoice(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/convert-proforma-to-invoice`, fetchOptions)
  }

  async removeProformaConcept(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/proforma-remove-charge`, fetchOptions)
  }


  async uploadZipTm(files: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(files)
    fetchOptions = {
      method: 'POST',
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/upload-invoices-tm`, fetchOptions)
  }

  async getInvoiceTmZipJobs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tm-zip-jobs`, fetchOptions)
  }

  async getInvoiceTmUploadJob(jobId: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tm-zip-jobs/${jobId}/job-details`, fetchOptions)
  }

  async getInvoiceTmByUuid(uuid: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/tm-zip-jobs/by-uuid/${uuid}`, fetchOptions)
  }

  async sendInvoiceByEmail(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/send-invoice-by-email`, fetchOptions)
  }

  async deleteCfdiLink(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/service-invoice-delete-cfdi-link`, fetchOptions)
  }

}

export default InvoicesModule
