import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export default class UserMailNotificationsModule extends FetchFactory<any> {
  private RESOURCE = '/admin/users'

  async list(userId: number | string, fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/${userId}/mail-notifications`, fetchOptions)
  }

  async link(userId: number | string, notificationId: number, data: { type: string; ports?: number[] }, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${userId}/mail-notifications/${notificationId}/link`, {
      body: JSON.stringify(data),
      ...fetchOptions,
    })
  }

  async unlink(userId: number | string, notificationId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${userId}/mail-notifications/${notificationId}/unlink`, fetchOptions)
  }

  async copyFromUser(userId: number | string, sourceUserId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/${userId}/mail-notifications/copy-from-user`, {
      body: JSON.stringify({ source_user_id: sourceUserId }),
      ...fetchOptions,
    })
  }
}
