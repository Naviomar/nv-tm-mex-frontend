import { type FetchOptions } from 'ofetch'

import FetchFactory from '../../factory'

class MailNotificationGroupsModule extends FetchFactory<any> {
  private RESOURCE = '/admin/mail-notification-groups'

  async getAll(entityType?: string, fetchOptions?: FetchOptions) {
    const params = entityType ? `?entity_type=${entityType}` : ''
    return this.call('GET', `${this.RESOURCE}/all${params}`, fetchOptions)
  }

  async getList(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}/details`, fetchOptions)
  }

  async getFormCatalogs(fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/form-catalogs`, fetchOptions)
  }

  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', this.RESOURCE, fetchOptions)
  }

  async update(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}/update`, fetchOptions)
  }

  async delete(id: string, fetchOptions?: FetchOptions) {
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default MailNotificationGroupsModule
