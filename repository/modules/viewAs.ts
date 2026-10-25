import { type FetchOptions } from 'ofetch'
import FetchFactory from '../factory'

export interface IViewAsUser {
  id: number
  name: string
  email: string
  roles: string[]
}

export default class ViewAsModule extends FetchFactory<any> {
  private RESOURCE = '/view-as'

  async users(search = '', fetchOptions?: FetchOptions) {
    return this.call('GET', `${this.RESOURCE}/users`, { ...fetchOptions, query: { search } })
  }

  async start(userId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/start`, { ...fetchOptions, body: { user_id: userId } })
  }

  async stop(userId: number, fetchOptions?: FetchOptions) {
    return this.call('POST', `${this.RESOURCE}/stop`, { ...fetchOptions, body: { user_id: userId } })
  }
}
