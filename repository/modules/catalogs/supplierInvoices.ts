import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

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

  async searchInvoiceForSupReqPayment(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-invoice-for-sup-req-payment`, fetchOptions)
  }

}

export default SupplierInvoicesModule
