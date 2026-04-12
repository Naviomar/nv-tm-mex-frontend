import { type FetchOptions } from 'ofetch'
import FetchFactory from '../../factory'

export interface ICcUser {
  id: number
  name: string
  email: string
}

class RequestCcUsersModule extends FetchFactory<any> {
  private RESOURCE = '/request-cc-users'

  async getCcUsers(type: string, id: number): Promise<ICcUser[]> {
    return this.call('GET', `${this.RESOURCE}/${type}/${id}`)
  }

  async addCcUsers(type: string, id: number, userIds: number[]): Promise<{ message: string; cc_users: ICcUser[] }> {
    return this.call('POST', `${this.RESOURCE}/${type}/${id}`, { body: { user_ids: userIds } })
  }

  async removeCcUser(type: string, id: number, userId: number): Promise<{ message: string; cc_users: ICcUser[] }> {
    return this.call('DELETE', `${this.RESOURCE}/${type}/${id}/${userId}`)
  }

  async searchAvailableUsers(search: string): Promise<ICcUser[]> {
    return this.call('GET', `${this.RESOURCE}/available-users`, { params: { search } })
  }
}

export default RequestCcUsersModule
