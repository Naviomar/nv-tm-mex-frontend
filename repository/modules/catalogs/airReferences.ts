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

class AirReferenceModule extends FetchFactory<IReferenciaPagination> {
  private RESOURCE = '/air-references'

  async getAirRferenceById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getAirRferenceProfitById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details-profit`, fetchOptions)
  }

  async getCharges(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/all-charges`, fetchOptions)
  }

  async getAllCharges(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/all-charges`, fetchOptions)
  }

  async saveCharge(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }

    if (withPermission) {
      return this.call('POST', `${this.RESOURCE}/${id}/save-charge-with-permission`, fetchOptions)
    } else {
      return this.call('POST', `${this.RESOURCE}/${id}/save-charge`, fetchOptions)
    }
  }

  async deleteAirCharge(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    if (withPermission) {
      return this.call('POST', `${this.RESOURCE}/${id}/delete-charge-with-permission`, fetchOptions)
    }
    return this.call('POST', `${this.RESOURCE}/${id}/delete-charge`, fetchOptions)
  }

  async getServiceNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/service-notes`, fetchOptions)
  }

  async addServiceNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-service-note`, fetchOptions)
  }

  async getAirServiceCustomerInvoices(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/air-service/${id}/customer-invoices`, fetchOptions)
  }

  async updatePrepaidCollectByType(id: string, form: any, withPermission: boolean, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    if (withPermission) {
      return this.call('POST', `${this.RESOURCE}/${id}/update-prepaid-collect-with-permission`, fetchOptions)
    } else {
      return this.call('POST', `${this.RESOURCE}/${id}/update-prepaid-collect`, fetchOptions)
    }
  }
}

export default AirReferenceModule
