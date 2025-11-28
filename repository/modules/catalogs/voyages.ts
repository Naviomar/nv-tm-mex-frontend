import { type FetchOptions, type $Fetch } from 'ofetch'
import objectToFormData from '~/utils/toFormData'
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IVoyagePagination = {
  data: IVoyage[]
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
type IVoyage = {
  id: number
  name: string
  vessel_id: number
  internal_code: string
  pol_id: number
  pod_id: number
  arrival_date: string
  eta_date: string
  created_at: string
}

class VoyagesModule extends FetchFactory<any> {
  private RESOURCE = '/admin/voyages'
  private RESOURCE2 = '/admin/voyage-destinations'

  /**
   * Return the voyages as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getVoyages(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getVoyageDestinations(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE2, fetchOptions)
  }

  async getVoyageDestinationsDemurrages(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/find-for-demurrages`, fetchOptions)
  }

  async getDestinationDetailsById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/${id}/with-voyage-details`, fetchOptions)
  }

  async getDestinationEtasById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/${id}/with-etas`, fetchOptions)
  }

  async getDestiantionReferenciasById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/${id}/with-referencias`, fetchOptions)
  }

  async searchImportVoyages(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/import/search`, fetchOptions)
  }
  async searchExportVoyages(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/export/search`, fetchOptions)
  }

  async updateDestinationEtaById(id: string, form: any, fetchOptions?: FetchOptions) {
    const body = objectToFormData(form)
    fetchOptions = {
      body: body,
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/update-eta`, fetchOptions)
  }

  async notifyPortByDestinationId(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/notify-port`, fetchOptions)
  }

  async addDestinationToVoyageId(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/add`, fetchOptions)
  }

  async updateDestination(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}`, fetchOptions)
  }

  async updateDestinationWithPermission(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/with-permission`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getFilterCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/filter-catalogs`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
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
    return this.call('POST', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async deleteDestination(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE2}/${id}`, fetchOptions)
  }

  async getVoyageNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/notes`, fetchOptions)
  }

  async addVoyageNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-note`, fetchOptions)
  }

  async getVoyageDestDemurrageDayReportXlsx(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE2}/${id}/demurrage-day-report-xlsx`, fetchOptions)
  }

  async registerDemurrageInitDay(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/register-demurrage-init-day`, fetchOptions)
  }

  async unlockVoyageDestination(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE2}/${id}/unlock`, fetchOptions)
  }
}

export default VoyagesModule
