import { type FetchOptions, type $Fetch } from 'ofetch'

// locals
import FetchFactory from '../../factory'

type IPagination = {
  page: string
  limit: string
}
type INotificationTypePagination = {
  data: INotificationType[]
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
type INotificationType = {
  id: number
  code: string
  name: string
}

class NotificationsTypesModule extends FetchFactory<INotificationTypePagination> {
  private RESOURCE = '/admin/notifications-types'
  /**
   * Return the notifications-types as array
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async getNotificationsTypes(fetchOptions?: FetchOptions) {
    return this.call('GET', this.RESOURCE, fetchOptions)
  }

  async updateNotificationsTypes(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async getById(id: string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${id}`, fetchOptions)
  }

  async addEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/add-email/${id}`, fetchOptions)
  }

  async updateEmail(id: string, form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}/update-email/${id}`, fetchOptions)
  }


  async deleteEmail(notyId: string, id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${notyId}/delete-email/${id}`, fetchOptions)
  }


  /**
   * Return a notifications-types
   * @param fetchOptions options for `useFetch`
   * @returns
   */
  async create(form: any, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'POST',
      body: JSON.stringify(form),
      ...fetchOptions,
    }
    return this.call('POST', `${this.RESOURCE}`, fetchOptions)
  }

  /**
   * Delete a notification-type by id
   * @param notificatiotype
   * @returns
   */
  async delete(id: string, fetchOptions?: FetchOptions) {
    fetchOptions = {
      method: 'DELETE',
      ...fetchOptions,
    }
    return this.call('DELETE', `${this.RESOURCE}/${id}`, fetchOptions)
  }
}

export default NotificationsTypesModule
