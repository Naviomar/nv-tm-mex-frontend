import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'
import objectToFormData from '~/utils/toFormData'

class SupplierInvoicesModule extends FetchFactory<any> {
  private RESOURCE = '/supplier-invoices'

  async getSeaImportSellProfit(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-import-sell-profit`, fetchOptions)
  }

  async getSeaExportSellProfit(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/sea-export-sell-profit`, fetchOptions)
  }

  async getAirSellProfit(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/air-sell-profit`, fetchOptions)
  }

  async findDeletedCfdisToLink(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/find-deleted-cfdis-to-link`, fetchOptions)
  }

  async linkDeletedCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/link-deleted-cfdi`, fetchOptions)
  }

  async unlinkDeletedCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/unlink-deleted-cfdi`, fetchOptions)
  }

  async addManualCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/add-manual-cfdi`, fetchOptions)
  }

  async addManualCfdis(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/add-manual-cfdis`, fetchOptions)
  }

  async previewManualCfdiImport(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: objectToFormData(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/preview-manual-import`, fetchOptions)
  }

  async downloadManualCfdiTemplate(fetchOptions?: FetchOptions) {
    fetchOptions = {
      responseType: 'blob',
      ...fetchOptions,
    }
    return this.call('GET', `${this.RESOURCE}/cfdis/download-manual-template`, fetchOptions)
  }

  async searchInvoiceForSupReqPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-invoice-for-sup-req-payment`, fetchOptions)
  }

}

export default SupplierInvoicesModule
