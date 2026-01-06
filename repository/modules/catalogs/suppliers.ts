import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

class SuppliersModule extends FetchFactory<any> {
  private RESOURCE = '/suppliers'

  /**
   * Return the shippers as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getSuppliers(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getAllSuppliers(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async filterCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/filter-catalogs`, fetchOptions)
  }

  async formCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async getAvailableAdvancePayments(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/available-advance-payments`, fetchOptions)
  }
  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async getAddresses(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/addresses/all`, fetchOptions)
  }

  async updateAddress(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/address`, fetchOptions)
  }

  async deleteAddress(id: string, idAddress: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}/address/${idAddress}`, fetchOptions)
  }

  async addEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-email`, fetchOptions)
  }

  async deleteEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-email`, fetchOptions)
  }

  async syncSupplierCfdiSupplier(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/sync-supplier`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${id}/delete`, fetchOptions)
  }

  async deleteCfdi(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/delete`, fetchOptions)
  }

  async getFactraCfdis(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdis`, fetchOptions)
  }

  async getSupplierCfdiCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdi-provision-catalogs`, fetchOptions)
  }

  async getFactraCfdisSearchFilters(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdis/search-filters`, fetchOptions)
  }

  async getSupplierCfdiById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdis/${id}/details`, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }

  async searchSuppliers(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  async updateSupplierOnCfdi(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/update-supplier`, fetchOptions)
  }

  async saveCfdiChanges(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/update-provision`, fetchOptions)
  }

  async deleteSupplierInvoiceInCfdi(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/remove-supplier-invoice`, fetchOptions)
  }

  async reSyncSupplierCapLimit(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/resync-cap-limit`, fetchOptions)
  }

  async getSeaImportInvoices(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/sea-import/${id}/invoices`, fetchOptions)
  }

  async getAdvancePaymentsByService(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/advance-payments/by-service`, fetchOptions)
  }

  async requestPaymentSearchInvoices(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request-payment/search-invoices`, fetchOptions)
  }

  async requestPaymentGetSelectionDetails(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/request-payment/suppliers/${id}/generate-req-payment`, fetchOptions)
  }

  async updateCfdiNotes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/update-notes`, fetchOptions)
  }

  async getSupplierCfdiNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/cfdis/${id}/notes`, fetchOptions)
  }

  async addSupplierCfdiNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/add-note`, fetchOptions)
  }

  async deleteSupplierCfdiNote(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/cfdis/${id}/delete-note`, fetchOptions)
  }

  async toggleFreeFormat(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/toggle-free-format`, fetchOptions)
  }

  async addCfdiCharge(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/charges`, fetchOptions)
  }

  async updateCfdiCharge(id: string, chargeId: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('PUT', `${this.RESOURCE}/cfdis/${id}/charges/${chargeId}`, fetchOptions)
  }

  async deleteCfdiCharge(id: string, chargeId: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/cfdis/${id}/charges/${chargeId}`, fetchOptions)
  }

  /**
   * Valida un CFDI individual con el SAT
   * @param id ID del CFDI
   * @param fetchOptions opciones de fetch
   */
  async validateCfdiSat(id: string, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/cfdis/${id}/validate-sat`, fetchOptions)
  }

  /**
   * Valida múltiples CFDIs con el SAT antes de generar solicitud de pago
   * @param form { supplierCfdis: Array<{ id: number }> }
   * @param fetchOptions opciones de fetch
   */
  async validateMultipleCfdisSat(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/cfdis/validate-multiple-sat`, fetchOptions)
  }

}

export default SuppliersModule
