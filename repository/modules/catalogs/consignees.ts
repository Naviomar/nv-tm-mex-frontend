import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type IConsigneePagination = {
  data: IConsignee[]
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
type IConsigneeCatalog = {
  executives: [] | null
}

type IConsignee = {
  id: number
  name: string
  address: any
  contact_name: string
  tax_number: string
  is_active: number | boolean
  is_import: number | boolean
  is_export: number | boolean
  is_air_import: number | boolean
  is_air_export: number | boolean
  consignee_executives: any
}
type IConsigneeExecutive = {
  id: number
  consignee_id: number
  executive_id: number
  valid_from: string
  valid_to: string
  is_active: number
}

class ConsigneesModule extends FetchFactory<any> {
  private RESOURCE = '/admin/consignees'

  /**
   * Return the shippers as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getConsignees(fetchOptions?: FetchOptions) {
    // const queryParams = '?' + new URLSearchParams(pagination).toString()
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getDetailsForReference(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/reference-details`, fetchOptions)
  }

  async getDetailsForExportReference(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/reference-export-details`, fetchOptions)
  }

  async getDetailsForInvoice(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/invoice-details`, fetchOptions)
  }

  async searchByName(body: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(body),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/search-by-name`, fetchOptions)
  }

  async deleteConsignee(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/executives/${id}`, fetchOptions)
  }
  async deleteEntrustLetter(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/entrust/${id}`, fetchOptions)
  }
  async deleteWarrantyLetter(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/warranty/${id}`, fetchOptions)
  }

  async upsertEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/upsert-email`, fetchOptions)
  }
  async deleteEmail(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/email/${id}`, fetchOptions)
  }

  async updateEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-email`, fetchOptions)
  }

  async getCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/catalogs`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async searchConsignees(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/search`, fetchOptions)
  }

  /**
   * Return a shipper
   * @param fetchOptions options for `useFetch`
   * @returns
   */
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

  async upsertEntrustLetter(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/upsert-entrust-letter`, fetchOptions)
  }

  async upsertWarrantyLetter(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/upsert-warranty-letter`, fetchOptions)
  }

  async updateExecutive(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-executive`, fetchOptions)
  }

  /**
   * Delete a user by id
   * @param user
   * @returns
   */
  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
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

  async getConsigneeEmails(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/get-emails`, fetchOptions)
  }

  async getEmailByMailNotifications(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/get-emails-by-mail-notifications`, fetchOptions)
  }

  async getServicePrints(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/service-prints`, fetchOptions)
  }

  async saveServicePrint(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/save-service-print`, fetchOptions)
  }

  async getCustomerNotes(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/notes`, fetchOptions)
  }

  async addCustomerNote(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/add-note`, fetchOptions)
  }

  async deleteNote(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}/delete-note`, fetchOptions)
  }

  async updateImportRebate(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-import-rebate`, fetchOptions)
  }

  async updateExportRebate(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update-export-rebate`, fetchOptions)
  }
}

export default ConsigneesModule
